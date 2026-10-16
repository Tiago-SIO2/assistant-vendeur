import { ErreurIA } from "@/lib/ia";

export function reponseErreurIA(erreur: unknown) {
  if (erreur instanceof ErreurIA && erreur.status === 429) {
    return Response.json(
      { erreur: "Le quota du service d'IA est atteint. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }
  if (erreur instanceof ErreurIA && erreur.status === 413) {
    return Response.json(
      { erreur: "Les mots-clés sont trop volumineux pour le service d'IA." },
      { status: 413 }
    );
  }
  if (erreur instanceof Error && erreur.name === "TimeoutError") {
    return Response.json(
      { erreur: "Le service d'IA met trop de temps à répondre. Réessayez plus tard." },
      { status: 504 }
    );
  }
  console.error(erreur);
  return Response.json(
    { erreur: "La génération de l'annonce a échoué. Réessayez plus tard." },
    { status: 502 }
  );
}