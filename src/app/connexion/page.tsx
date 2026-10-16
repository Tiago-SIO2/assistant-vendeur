import { redirect } from "next/navigation";
import FormulaireConnexion from "@/components/FormulaireConnexion";
import { creerClientServeur } from "@/lib/supabase/server";

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
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-3xl font-bold">Assistant Vendeur</h1>
      <p className="mt-2 text-gray-500">
        Connecte-toi avec un lien reçu par e-mail, sans mot de passe.
      </p>
      {erreur && (
        <p className="mt-4 text-red-600">Le lien est invalide ou a expiré. Demande un nouveau lien.</p>
      )}
      <FormulaireConnexion />
    </main>
  );
}