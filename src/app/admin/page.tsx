import { notFound } from "next/navigation";
import TableauStatut from "@/components/TableauStatut";
import { estAdmin } from "@/lib/admin";
import { CONTROLES } from "@/lib/controles";
import { executerControle, pireEtat, type Rapport } from "@/lib/statut";
import { creerClientServeur } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PageAdmin() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !estAdmin(user.email)) {
    notFound();
  }

  const resultats = await Promise.all(CONTROLES.map(executerControle));
  const rapport: Rapport = {
    global: pireEtat(resultats),
    verifieLe: new Date().toISOString(),
    resultats,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Administration</h1>
      <p className="mt-2 text-encre/60">État des services dont dépend l’application.</p>
      <TableauStatut rapportInitial={rapport} />
    </main>
  );
}