import Link from "next/link";
import { notFound } from "next/navigation";
import CarteArticle from "@/components/CarteArticle";
import FormulaireArticle from "@/components/FormulaireArticle";
import { COLONNES_ITEM, type Item } from "@/lib/annonce";
import { creerClientServeur } from "@/lib/supabase/server";


export const dynamic = "force-dynamic";

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

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/" className="text-blue-500 underline">
        ← Mes collections
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{collection.nom}</h1>
      <p className="mt-1 text-gray-500">{items.length} article(s)</p>

      <FormulaireArticle collectionId={id} />

      <section className="mt-4">
        {items.length === 0 && (
          <p className="mt-6 text-gray-500">Aucun article pour l’instant.</p>
        )}
        {items.map((item) => (
          <CarteArticle key={item.id} item={item} />
        ))}
      </section>
    </main>
  );
}