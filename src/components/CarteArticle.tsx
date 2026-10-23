import AffichageAnnonce from "@/components/AffichageAnnonce";
import { itemVersAnnonce, type Item } from "@/lib/annonce";

export default function CarteArticle({
  item,
  photoUrl = null,
}: {
  item: Item;
  photoUrl?: string | null;
}) {
  if (item.statut === "termine") {
    return <AffichageAnnonce annonce={itemVersAnnonce(item)} photoUrl={photoUrl} />;
  }

  if (item.statut === "erreur") {
    return (
      <article className="flex h-full flex-col justify-center rounded-3xl border border-corail-500 bg-corail-50 p-6">
        <p className="font-titre text-lg font-semibold text-corail-600">La génération a échoué</p>
        <p className="mt-1 text-sm text-corail-600">Réessaie dans quelques instants.</p>
        <p className="mt-3 truncate text-xs text-encre/50">{item.mots_cles}</p>
      </article>
    );
  }

  return (
    <article className="flex h-full animate-pulse flex-col rounded-3xl border border-sable bg-white p-6">
      <div className="h-5 w-3/4 rounded-full bg-sable" />
      <div className="mt-3 h-3 w-1/2 rounded-full bg-creme" />
      <div className="mt-6 h-3 w-full rounded-full bg-creme" />
      <div className="mt-2 h-3 w-5/6 rounded-full bg-creme" />
      <p className="mt-6 font-titre text-sm italic text-sauge-600">Rédaction de l’annonce…</p>
    </article>
  );
}