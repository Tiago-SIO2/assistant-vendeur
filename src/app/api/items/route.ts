import { COLONNES_ITEM, FORMAT_UUID, LIMITES } from "@/lib/annonce";
import { formaterDelai, verifierLimite, type ResultatLimite } from "@/lib/limitation";
import { NOMBRE_RELANCES, qstash } from "@/lib/qstash";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { creerClientServeur } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // 0. Session
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  // 1. Validation
  const body = await request.json();
  const motsCles = typeof body.mots_cles === "string" ? body.mots_cles.trim() : "";
  const collectionId = typeof body.collection_id === "string" ? body.collection_id : "";
  const photoPath = typeof body.photo_path === "string" ? body.photo_path : null; // photo

  if (!FORMAT_UUID.test(collectionId)) {
    return Response.json({ erreur: "Collection invalide." }, { status: 400 });
  }
  if (motsCles.length < LIMITES.motsClesMin || motsCles.length > LIMITES.motsClesMax) {
    return Response.json(
      { erreur: `Les mots-clés doivent contenir entre ${LIMITES.motsClesMin} et ${LIMITES.motsClesMax} caractères.` },
      { status: 400 }
    );
  }
  const formatPhoto = new RegExp(`^${user.id}/[0-9a-f-]{36}\\.(jpg|png|webp)$`); // photo
  if (photoPath !== null && !formatPhoto.test(photoPath)) { // photo
    return Response.json({ erreur: "Photo invalide." }, { status: 400 }); // photo
  } // photo

  // 2. La collection appartient-elle à l'utilisateur ? (RLS)
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .maybeSingle();
  if (!collection) {
    return Response.json({ erreur: "Collection introuvable." }, { status: 404 });
  }

  // 3. Limitation de débit
  let limite: ResultatLimite;
  try {
    limite = await verifierLimite(user.id);
  } catch (erreur) {
    console.error("Limitation de débit indisponible :", erreur);
    return Response.json(
      { erreur: "Service temporairement indisponible. Réessayez plus tard." },
      { status: 503 }
    );
  }
  if (!limite.autorise) {
    return Response.json(
      { erreur: `Tu as atteint la limite de générations. Réessaie dans ${formaterDelai(limite.secondesAvantReprise)}.` },
      { status: 429, headers: { "Retry-After": String(limite.secondesAvantReprise) } }
    );
  }

  // 4. Création de l'article « en attente », avec la session de l'utilisateur
  const { data: item, error } = await supabase
    .from("items")
    .insert({
      collection_id: collectionId,
      mots_cles: motsCles,
      photo_path: photoPath, // photo
      statut: "en_attente",
    })
    .select(COLONNES_ITEM)
    .single();

  if (error || !item) {
    console.error("Erreur lors de la création de l'article :", error);
    return Response.json(
      { erreur: "L'article n'a pas pu être créé. Réessayez plus tard." },
      { status: 500 }
    );
  }

  // 5. Mise en file : QStash appellera le worker
  try {
    await qstash.publishJSON({
      url: `${process.env.APP_URL}/api/worker`,
      body: { item_id: item.id },
      retries: NOMBRE_RELANCES,
    });
  } catch (erreurFile) {
    console.error("Mise en file impossible :", erreurFile);
    // Pas de règle UPDATE pour l'utilisateur : le serveur passe par le client admin
    await creerClientAdmin().from("items").update({ statut: "erreur" }).eq("id", item.id);
    return Response.json(
      { erreur: "La génération n'a pas pu être lancée. Réessayez plus tard." },
      { status: 503 }
    );
  }

  // 6. Réponse immédiate : 202 = accepté, traitement en cours
  return Response.json(item, { status: 202 });
}