import { LIMITES, type Annonce } from "@/lib/annonce";

export async function POST(request: Request) {
  const body = await request.json();
  const motsCles = typeof body.mots_cles === "string" ? body.mots_cles.trim() : "";

  if (motsCles.length < LIMITES.motsClesMin || motsCles.length > LIMITES.motsClesMax) {
    return Response.json(
      { erreur: `Les mots-clés doivent contenir entre ${LIMITES.motsClesMin} et ${LIMITES.motsClesMax} caractères.` },
      { status: 400 }
    );
  }

  // Simulation du temps de réponse d'un modèle d'IA
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Annonce simulée, remplacée par l'IA à l'étape 5
  const annonce: Annonce = {
    mots_cles: motsCles,
    description: `Description simulée pour « ${motsCles} ».`,
    prix_estime: 25,
  };

  return Response.json(annonce);
}