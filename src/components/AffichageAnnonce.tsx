import Image from "next/image";
import BoutonCopier from "@/components/BoutonCopier";
import { annonceEnTexte, type Annonce } from "@/lib/annonce";

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function AffichageAnnonce({
  annonce,
  photoUrl = null,
}: {
  annonce: Annonce;
  photoUrl?: string | null;
}) {
  const caracteristiques = [
    { libelle: "Marque", valeur: annonce.marque },
    { libelle: "Taille", valeur: annonce.taille },
    { libelle: "État", valeur: annonce.etat === "Non précisé" ? "" : annonce.etat },
    { libelle: "Couleur", valeur: annonce.couleur },
  ].filter((c) => c.valeur !== "");

  return (
    <article className="mt-6 overflow-hidden rounded-xl border">
      {photoUrl && (
        <div className="relative aspect-[4/5] w-full bg-gray-100">
          <Image
            src={photoUrl}
            alt={annonce.titre}
            fill
            unoptimized
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-teal-600 px-3 py-1 text-lg font-bold text-white shadow">
            {formatPrix.format(annonce.prix_estime)}
          </span>
        </div>
      )}

      <div className="p-6">
        <h2 className="text-xl font-semibold">{annonce.titre}</h2>
        {!photoUrl && (
          <p className="mt-1 text-3xl font-bold text-teal-600">
            {formatPrix.format(annonce.prix_estime)}
          </p>
        )}

        {caracteristiques.length > 0 && (
          <dl className="mt-5 divide-y border-y text-sm">
            {caracteristiques.map((c) => (
              <div key={c.libelle} className="flex justify-between py-2">
                <dt className="text-gray-500">{c.libelle}</dt>
                <dd className="font-medium">{c.valeur}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-5 whitespace-pre-line leading-relaxed">{annonce.description}</p>

        {annonce.hashtags.length > 0 && (
          <p className="mt-4 text-sm text-teal-600">
            {annonce.hashtags.map((h) => `#${h}`).join(" ")}
          </p>
        )}

        <div className="mt-6">
          <BoutonCopier texte={annonceEnTexte(annonce)} />
        </div>

        <p className="mt-3 text-xs text-gray-500">Généré à partir de : {annonce.mots_cles}</p>
      </div>
    </article>
  );
}