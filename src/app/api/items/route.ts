import { COLONNES_ITEM, FORMAT_UUID, LIMITES } from "@/lib/annonce";
import { genererAnnonce, type ResultatGeneration } from "@/lib/generer-annonce";
import { reponseErreurIA } from "@/lib/erreurs-ia";
import { creerClientServeur } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  const body = await request.json();
  const motsCles = typeof body.mots_cles === "string" ? body.mots_cles.trim() : "";
  const collectionId = typeof body.collection_id === "string" ? body.collection_id : "";
  const photoPath = typeof body.photo_path === "string" ? body.photo_path : null;

  if (!FORMAT_UUID.test(collectionId)) {
    return Response.json({ erreur: "Collection invalide." }, { status: 400 });
  }
  if (motsCles.length < LIMITES.motsClesMin || motsCles.length > LIMITES.motsClesMax) {
    return Response.json(
      { erreur: `Les mots-clés doivent contenir entre ${LIMITES.motsClesMin} et ${LIMITES.motsClesMax} caractères.` },
      { status: 400 }
    );
  }

  // La photo doit être dans le dossier de l'utilisateur, avec un nom au bon format
  const formatPhoto = new RegExp(
    `^${user.id}/[0-9a-f-]{36}\\.(jpg|png|webp)$`
  );
  if (photoPath !== null && !formatPhoto.test(photoPath)) {
    return Response.json({ erreur: "Photo invalide." }, { status: 400 });
  }

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .maybeSingle();
  if (!collection) {
    return Response.json({ erreur: "Collection introuvable." }, { status: 404 });
  }

  let resultat: ResultatGeneration;
  try {
    resultat = await genererAnnonce(motsCles);
  } catch (erreur) {
    return reponseErreurIA(erreur);
  }

  const { annonce } = resultat;
  const { data, error } = await supabase
    .from("items")
    .insert({
      collection_id: collectionId,
      mots_cles: motsCles,
      titre: annonce.titre,
      description: annonce.description,
      prix_estime: annonce.prix_estime,
      marque: annonce.marque,
      taille: annonce.taille,
      couleur: annonce.couleur,
      etat: annonce.etat,
      hashtags: annonce.hashtags,
      photo_path: photoPath,
      statut: "termine",
    })
    .select(COLONNES_ITEM)
    .single();

  if (error) {
    console.error("Erreur lors de l'enregistrement de l'article :", error);
    return Response.json(
      { erreur: "L'annonce a été générée mais n'a pas pu être enregistrée." },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 201 });
}