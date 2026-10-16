import { COLONNES_ITEM, FORMAT_UUID, LIMITES } from "@/lib/annonce";
import { genererAnnonce, type ResultatGeneration } from "@/lib/generer-annonce";
import { reponseErreurIA } from "@/lib/erreurs-ia";
import { creerClientServeur } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // 0. La session est vérifiée avant tout : inutile de consommer du quota d'IA pour un anonyme
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

  if (!FORMAT_UUID.test(collectionId)) {
    return Response.json({ erreur: "Collection invalide." }, { status: 400 });
  }
  if (motsCles.length < LIMITES.motsClesMin || motsCles.length > LIMITES.motsClesMax) {
    return Response.json(
      { erreur: `Les mots-clés doivent contenir entre ${LIMITES.motsClesMin} et ${LIMITES.motsClesMax} caractères.` },
      { status: 400 }
    );
  }

  // 1. La collection existe-t-elle ET appartient-elle à l'utilisateur ? (la RLS filtre)
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .maybeSingle();
  if (!collection) {
    return Response.json({ erreur: "Collection introuvable." }, { status: 404 });
  }

  // 2. Génération par l'IA
  let resultat: ResultatGeneration;
  try {
    resultat = await genererAnnonce(motsCles);
  } catch (erreur) {
    return reponseErreurIA(erreur);
  }

  // 3. Enregistrement (user_id est rempli par la base grâce à auth.uid())
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