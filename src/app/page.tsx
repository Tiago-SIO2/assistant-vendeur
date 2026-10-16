import Link from "next/link";
import FormulaireCollection from "@/components/FormulaireCollection";
import type { Collection } from "@/lib/annonce";
import { creerClientAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("collections")
    .select("id, nom, created_at")
    .order("created_at", { ascending: false });
  const collections = (data ?? []) as Collection[];

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Mes collections</h1>
      <p className="mt-2 text-gray-500">
        Regroupe tes vêtements par collection, puis génère une annonce prête à publier en quelques mots.
      </p>

      <FormulaireCollection />

      {error && <p className="mt-6 text-red-600">Impossible de charger les collections.</p>}
      {!error && collections.length === 0 && (
        <p className="mt-6 text-gray-500">Aucune collection pour l’instant.</p>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {collections.map((collection) => (
          <li key={collection.id}>
            <Link
              href={`/collections/${collection.id}`}
              className="block rounded-lg border p-4 hover:border-blue-500"
            >
              <p className="font-medium">{collection.nom}</p>
              <p className="text-sm text-gray-500">
                Créée le {new Date(collection.created_at).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}