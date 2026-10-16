import { notFound } from "next/navigation";
import TableauStatut from "@/components/TableauStatut";
import { verifierTousLesServices } from "@/lib/controles";

export const dynamic = "force-dynamic";

export default async function PageAdmin() {
  // Réservé au local tant que l'authentification n'existe pas
  if (process.env.NODE_ENV === "production") {
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