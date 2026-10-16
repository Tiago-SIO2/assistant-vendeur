import { LIMITES } from "@/lib/annonce";
import { genererAnnonce } from "@/lib/generer-annonce";
import { reponseErreurIA } from "@/lib/erreurs-ia";

export async function POST(request: Request) {
  const body = await request.json();
  const motsCles = typeof body.mots_cles === "string" ? body.mots_cles.trim() : "";

  if (motsCles.length < LIMITES.motsClesMin || motsCles.length > LIMITES.motsClesMax) {
    return Response.json(
      { erreur: `Les mots-clés doivent contenir entre ${LIMITES.motsClesMin} et ${LIMITES.motsClesMax} caractères.` },
      { status: 400 }
    );
  }

  try {
    const { annonce } = await genererAnnonce(motsCles);
    return Response.json(annonce);
  } catch (erreur) {
    return reponseErreurIA(erreur);
  }
}