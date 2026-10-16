import { executerControle, pireEtat, type Controle, type Rapport } from "@/lib/statut";

const controleVercel: Controle = {
  service: "Vercel",
  description: "Hébergement et fonctions serverless",
  verifier: async () => {
    const env = process.env.VERCEL_ENV ?? "local";
    const region = process.env.VERCEL_REGION ?? "poste local";
    const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? "aucun").slice(0, 7);
    return `Environnement : ${env} · Région : ${region} · Commit : ${commit}`;
  },
};

const controleIA: Controle = {
  service: "Modèle d'IA",
  description: "Génération des annonces (API compatible OpenAI)",
  verifier: async () => {
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;
    if (!baseUrl || !apiKey || !model) {
      throw new Error("Configuration incomplète (AI_BASE_URL, AI_API_KEY ou AI_MODEL)");
    }

    // GET /models vérifie la clé et le modèle sans consommer de tokens
    const reponse = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!reponse.ok) {
      throw new Error(`L'API répond avec le code ${reponse.status}`);
    }

    const donnees: { data: { id: string }[] } = await reponse.json();
    if (!donnees.data.some((m) => m.id === model)) {
      throw new Error(`Le modèle ${model} n'est pas disponible`);
    }
    return `Modèle ${model} disponible sur ${new URL(baseUrl).host}`;
  },
};

const CONTROLES: Controle[] = [controleVercel, controleIA];

export async function verifierTousLesServices(): Promise<Rapport> {
  const resultats = await Promise.all(CONTROLES.map(executerControle));
  return {
    global: pireEtat(resultats),
    verifieLe: new Date().toISOString(),
    resultats,
  };
}