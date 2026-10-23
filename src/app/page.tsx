import Link from "next/link";
import FormulaireCollection from "@/components/FormulaireCollection";
import Logo from "@/components/Logo";
import Ornement from "@/components/Ornement";
import type { Collection } from "@/lib/annonce";
import { creerClientServeur } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CollectionAvecCompte = Collection & { items: { count: number }[] };

export default async function Home() {
  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("collections")
    .select("id, nom, created_at, items(count)")
    .order("created_at", { ascending: false });
  const collections = (data ?? []) as CollectionAvecCompte[];
  const totalAnnonces = collections.reduce((somme, c) => somme + (c.items[0]?.count ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="grid items-center gap-8 rounded-3xl border border-sable bg-white px-6 py-10 sm:px-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-sauge-700">
            <span className="h-2 w-2 rotate-45 bg-or-500" aria-hidden="true" />
            Vos annonces de vêtements par l’IA
          </p>
          <h1 className="mt-4 font-titre text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Vends plus vite, <span className="italic text-sauge-600">écris moins.</span>
          </h1>
          <p className="mt-4 max-w-lg text-encre/70">
            Quelques mots-clés suffisent : titre, description, prix et hashtags sont prêts à coller sur Vinted.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div>
              <p className="font-titre text-3xl font-semibold">{collections.length}</p>
              <p className="text-sm text-encre/60">collection{collections.length > 1 ? "s" : ""}</p>
            </div>
            <span className="h-2 w-2 rotate-45 bg-or-500" aria-hidden="true" />
            <div>
              <p className="font-titre text-3xl font-semibold">{totalAnnonces}</p>
              <p className="text-sm text-encre/60">annonce{totalAnnonces > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <Logo taille={200} avecTexte={false} />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-titre text-3xl font-semibold tracking-tight">Mes collections</h2>
            <p className="mt-1 text-encre/60">Un vide-dressing, une saison, une marque : à toi de ranger.</p>
          </div>
        </div>

        <FormulaireCollection />

        {error && <p className="mt-6 text-corail-600">Impossible de charger les collections.</p>}

        {!error && collections.length === 0 && (
          <div className="mt-8 rounded-3xl border-2 border-dashed border-sable p-12 text-center">
            <p className="font-titre text-2xl">Ta première collection t’attend</p>
            <p className="mt-2 text-encre/60">Donne-lui un nom juste au-dessus pour commencer.</p>
          </div>
        )}

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => {
            const nombre = collection.items[0]?.count ?? 0;
            return (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-sable bg-white p-6 transition hover:-translate-y-1 hover:border-sauge-500"
                >
                  <span className="font-titre text-sm italic text-or-500">
                    Nº {String(collections.length - index).padStart(2, "0")}
                  </span>
                  <p className="mt-2 font-titre text-2xl font-semibold leading-snug group-hover:text-sauge-700">
                    {collection.nom}
                  </p>
                  <Ornement className="my-4" />
                  <p className="text-sm text-encre/60">
                    {nombre} annonce{nombre > 1 ? "s" : ""} · {new Date(collection.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  <span className="mt-auto pt-4 text-sm font-medium text-sauge-600">Ouvrir la collection →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}