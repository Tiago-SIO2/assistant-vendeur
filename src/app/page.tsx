import FormulaireArticle from "@/components/FormulaireArticle";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Assistant Vendeur</h1>
      <p className="mt-2 text-gray-600">
        Décris ton vêtement en quelques mots, obtiens un prix estimé et une annonce prête à publier.
      </p>
      <FormulaireArticle />
    </main>
  );
}