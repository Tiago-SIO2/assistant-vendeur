export const ETATS = [
  "Neuf avec étiquette",
  "Neuf sans étiquette",
  "Très bon état",
  "Bon état",
  "Satisfaisant",
  "Non précisé",
] as const;

export type Etat = (typeof ETATS)[number];

export type Annonce = {
  mots_cles: string;
  titre: string;
  description: string;
  prix_estime: number;
  marque: string;
  taille: string;
  couleur: string;
  etat: Etat;
  hashtags: string[];
};

export const LIMITES = {
  motsClesMin: 10,
  motsClesMax: 300,
};

export function annonceEnTexte(annonce: Annonce): string {
  const caracteristiques = [
    annonce.marque && `Marque : ${annonce.marque}`,
    annonce.taille && `Taille : ${annonce.taille}`,
    annonce.etat !== "Non précisé" && `État : ${annonce.etat}`,
    annonce.couleur && `Couleur : ${annonce.couleur}`,
  ].filter(Boolean);

  return [
    annonce.titre,
    annonce.description,
    caracteristiques.join("\n"),
    annonce.hashtags.map((h) => `#${h}`).join(" "),
  ]
    .filter(Boolean)
    .join("\n\n");
}