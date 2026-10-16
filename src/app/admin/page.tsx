import { notFound } from "next/navigation";
import TableauStatut from "@/components/TableauStatut";
import { estAdmin } from "@/lib/admin";
import { verifierTousLesServices } from "@/lib/controles";
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

  const rapport = await verifierTousLesServices();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">Administration</h1>
      <p className="mt-2 text-gray-500">État des services dont dépend l’application.</p>
      <TableauStatut rapportInitial={rapport} />
    </main>
  );
}