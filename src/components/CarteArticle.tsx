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

  return (
    <article className="mt-6 rounded-xl border p-6">
      <p className="text-sm text-gray-500">{item.mots_cles}</p>
      {item.statut === "en_attente" ? (
        <p className="mt-2 animate-pulse text-blue-600">Génération en cours…</p>
      ) : (
        <p className="mt-2 text-red-600">La génération a échoué. Réessaie plus tard.</p>
      )}
    </article>
  );
}