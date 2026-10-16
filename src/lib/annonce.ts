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

export type Statut = "en_attente" | "termine" | "erreur";

export type Collection = {
  id: string;
  nom: string;
  created_at: string;
};

export type Item = {
  id: string;
  collection_id: string;
  mots_cles: string;
  titre: string | null;
  description: string | null;
  prix_estime: number | null;
  marque: string | null;
  taille: string | null;
  couleur: string | null;
  etat: Etat | null;
  hashtags: string[] | null;
  photo_path: string | null;
  statut: Statut;
  created_at: string;
};

export const COLONNES_ITEM =
  "id, collection_id, mots_cles, titre, description, prix_estime, marque, taille, couleur, etat, hashtags, photo_path, statut, created_at";

export const FORMAT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const LIMITES = {
  motsClesMin: 10,
  motsClesMax: 300,
  nomCollectionMax: 100,
};

export const PHOTOS = {
  bucket: "photos",
  tailleMaxOctets: 5 * 1024 * 1024,
  extensions: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  } as Record<string, string>,
  dureeLienSecondes: 3600,
};

export function itemVersAnnonce(item: Item): Annonce {
  return {
    mots_cles: item.mots_cles,
    titre: item.titre ?? "",
    description: item.description ?? "",
    prix_estime: Number(item.prix_estime ?? 0),
    marque: item.marque ?? "",
    taille: item.taille ?? "",
    couleur: item.couleur ?? "",
    etat: item.etat ?? "Non précisé",
    hashtags: item.hashtags ?? [],
  };
}

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