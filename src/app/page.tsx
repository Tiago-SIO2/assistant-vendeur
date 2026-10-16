// Page d'accueil — route "/"
// Server Component par défaut : rendu côté serveur, aucun JavaScript envoyé au client.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Assistant Vendeur</h1>
      <p className="text-center text-gray-600">
        Génère automatiquement un prix et une description pour tes vêtements de seconde main.
      </p>
    </main>
  );
}