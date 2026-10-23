import Link from "next/link";
import { notFound } from "next/navigation";
import CarteArticle from "@/components/CarteArticle";
import FormulaireArticle from "@/components/FormulaireArticle";
import Ornement from "@/components/Ornement";
import { COLONNES_ITEM, PHOTOS, type Item } from "@/lib/annonce";
import { creerClientServeur } from "@/lib/supabase/server";
import SuiviTempsReel from "@/components/SuiviTempsReel";

export const dynamic = "force-dynamic";

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default async function PageCollection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await creerClientServeur();

  const { data: collection } = await supabase
    .from("collections")
    .select("id, nom")
    .eq("id", id)
    .maybeSingle();

  if (!collection) {
    notFound();
  }

  const { data } = await supabase
    .from("items")
    .select(COLONNES_ITEM)
    .eq("collection_id", id)
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Item[];

  const chemins = items
    .map((item) => item.photo_path)
    .filter((chemin): chemin is string => chemin !== null);

  const liens = new Map<string, string>();
  if (chemins.length > 0) {
    const { data: signes } = await supabase.storage
      .from(PHOTOS.bucket)
      .createSignedUrls(chemins, PHOTOS.dureeLienSecondes);
    for (const signe of signes ?? []) {
      if (signe.path && signe.signedUrl) liens.set(signe.path, signe.signedUrl);
    }
  }

  const valeurTotale = items
    .filter((item) => item.statut === "termine")
    .reduce((somme, item) => somme + Number(item.prix_estime ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm font-medium text-sauge-600 hover:underline">
        <SuiviTempsReel collectionId={id} />
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-titre text-4xl font-semibold tracking-tight">{collection.nom}</h1>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-sable bg-white px-5 py-3">
            <p className="font-titre text-2xl font-semibold">{items.length}</p>
            <p className="text-xs text-encre/60">{items.length > 1 ? "annonces" : "annonce"}</p>
          </div>
          <div className="rounded-2xl border border-sable bg-white px-5 py-3">
            <p className="font-titre text-2xl font-semibold text-sauge-700">{formatPrix.format(valeurTotale)}</p>
            <p className="text-xs text-encre/60">valeur estimée</p>
          </div>
        </div>
      </div>

      <Ornement className="my-8" />

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <FormulaireArticle collectionId={id} />
        </aside>

        <section>
          {items.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-sable p-12 text-center">
              <p className="font-titre text-2xl">Aucune annonce pour l’instant</p>
              <p className="mt-2 text-encre/60">Décris ton premier vêtement dans le formulaire.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((item) => (
                <CarteArticle
                  key={item.id}
                  item={item}
                  photoUrl={item.photo_path ? liens.get(item.photo_path) ?? null : null}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}