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
  const pastilles = [annonce.marque, annonce.taille && `Taille ${annonce.taille}`, annonce.couleur].filter(
    (valeur): valeur is string => Boolean(valeur)
  );
  const etatConnu = annonce.etat !== "Non précisé";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-sable bg-white transition hover:border-sauge-500">
      {photoUrl && (
        <div className="relative aspect-[4/5] w-full bg-sable">
          <Image src={photoUrl} alt={annonce.titre} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
          {etatConnu && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-corail-600">
              {annonce.etat}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-titre text-xl font-semibold leading-snug">{annonce.titre}</h3>
          <p className="shrink-0 font-titre text-2xl font-semibold text-sauge-700">
            {formatPrix.format(annonce.prix_estime)}
          </p>
        </div>

        {(pastilles.length > 0 || (!photoUrl && etatConnu)) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {!photoUrl && etatConnu && (
              <span className="rounded-full border border-corail-500 px-2.5 py-0.5 text-xs font-medium text-corail-600">
                {annonce.etat}
              </span>
            )}
            {pastilles.map((pastille) => (
              <span key={pastille} className="rounded-full bg-creme px-2.5 py-0.5 text-xs font-medium text-encre/80">
                {pastille}
              </span>
            ))}
          </div>
        )}

        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-sable" />
          <span className="h-1.5 w-1.5 rotate-45 bg-or-500" />
          <span className="h-px flex-1 bg-sable" />
        </div>

        <p className="whitespace-pre-line text-sm leading-relaxed text-encre/80">{annonce.description}</p>

        {annonce.hashtags.length > 0 && (
          <p className="mt-3 text-sm font-medium text-sauge-600">
            {annonce.hashtags.map((h) => `#${h}`).join(" ")}
          </p>
        )}

        <div className="mt-auto pt-5">
          <BoutonCopier texte={annonceEnTexte(annonce)} />
          <p className="mt-2 truncate text-xs text-encre/40" title={annonce.mots_cles}>
            À partir de : {annonce.mots_cles}
          </p>
        </div>
      </div>
    </article>
  );
}