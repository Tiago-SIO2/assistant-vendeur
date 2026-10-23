import { redirect } from "next/navigation";
import FormulaireConnexion from "@/components/FormulaireConnexion";
import Logo from "@/components/Logo";
import { creerClientServeur } from "@/lib/supabase/server";

const ATOUTS = [
  "Titre, description et hashtags rédigés pour toi",
  "Un prix estimé selon la marque et l’état",
  "Tes annonces rangées par collection",
];

export default async function PageConnexion({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { erreur } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col items-center justify-center gap-10 bg-encre p-12 text-creme lg:flex">
        <Logo taille={260} avecTexte={false} />
        <div className="max-w-md text-center">
          <h1 className="font-titre text-4xl font-semibold leading-tight">
            Tes vêtements méritent <span className="italic text-or-500">une belle annonce.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-left text-creme/80">
            {ATOUTS.map((atout) => (
              <li key={atout} className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rotate-45 bg-or-500" aria-hidden="true" />
                {atout}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <Logo taille={48} />
          </div>
          <h2 className="font-titre text-3xl font-semibold">Bon retour</h2>
          <p className="mt-2 text-encre/60">Reçois un lien de connexion par e-mail, sans mot de passe.</p>
          {erreur && (
            <p className="mt-4 rounded-2xl bg-corail-50 p-3 text-sm text-corail-600">
              Le lien est invalide ou a expiré. Demande un nouveau lien.
            </p>
          )}
          <FormulaireConnexion />
        </div>
      </section>
    </main>
  );
}