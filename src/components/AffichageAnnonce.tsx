import type { Annonce } from "@/lib/annonce";

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function AffichageAnnonce({ annonce }: { annonce: Annonce }) {
  return (
    <article className="mt-6 rounded-lg border p-6">
      <p className="text-sm text-gray-500">{annonce.mots_cles}</p>
      <p className="mt-2 text-2xl font-bold">{formatPrix.format(annonce.prix_estime)}</p>
      <p className="mt-4 whitespace-pre-line text-gray-800">{annonce.description}</p>
    </article>
  );
}