import "server-only";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { propagateAttributes, startObservation } from "@langfuse/tracing";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import type { ResultatGeneration } from "@/lib/generer-annonce";
import type { Usage } from "@/lib/ia";

// Un seul processeur pour toute l'application (gardé en mémoire entre deux rechargements en local)
const memoire = globalThis as unknown as { processeurLangfuse?: LangfuseSpanProcessor };

function initialiserLangfuse(): LangfuseSpanProcessor | null {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) return null;

  if (!memoire.processeurLangfuse) {
    const processeur = new LangfuseSpanProcessor({
      publicKey,
      secretKey,
      baseUrl: process.env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com",
      environment: process.env.VERCEL_ENV ?? "local",
    });
    const fournisseur = new NodeTracerProvider({ spanProcessors: [processeur] });
    fournisseur.register();
    memoire.processeurLangfuse = processeur;
  }

  return memoire.processeurLangfuse;
}

function calculerCout(usage: Usage) {
  const prixEntree = Number(process.env.AI_PRIX_ENTREE_PAR_MILLION ?? 0);
  const prixSortie = Number(process.env.AI_PRIX_SORTIE_PAR_MILLION ?? 0);
  const entree = (usage.entree / 1_000_000) * prixEntree;
  const sortie = (usage.sortie / 1_000_000) * prixSortie;
  return { input: entree, output: sortie, total: entree + sortie };
}

type Contexte = {
  utilisateur: string;
  itemId: string;
  entree: unknown;
};

// Exécute la génération en la traçant dans Langfuse : durée, tokens, coût, et erreurs éventuelles
export async function avecTraceGeneration(
  contexte: Contexte,
  executer: () => Promise<ResultatGeneration>
): Promise<ResultatGeneration> {
  const processeur = initialiserLangfuse();
  if (!processeur) return executer();

  let resultat: ResultatGeneration | undefined;
  let erreurCapturee: unknown;

  await propagateAttributes(
    { userId: contexte.utilisateur, metadata: { item_id: contexte.itemId } },
    async () => {
      const generation = startObservation(
        "generation-annonce",
        { model: process.env.AI_MODEL, input: contexte.entree },
        { asType: "generation" }
      );

      try {
        resultat = await executer();
        generation.update({
          model: resultat.modele,
          output: resultat.annonce,
          usageDetails: {
            input: resultat.usage.entree,
            output: resultat.usage.sortie,
            total: resultat.usage.total,
          },
          costDetails: calculerCout(resultat.usage),
        });
      } catch (erreur) {
        erreurCapturee = erreur;
        generation.update({
          level: "ERROR",
          statusMessage: erreur instanceof Error ? erreur.message : "Erreur inconnue",
        });
      } finally {
        generation.end();
      }
    }
  );

  // En serverless, la fonction peut s'arrêter juste après : on envoie les traces tout de suite
  try {
    await processeur.forceFlush();
  } catch (erreur) {
    // L'observabilité ne doit jamais faire échouer la génération
    console.error("Langfuse injoignable :", erreur);
  }

  if (erreurCapturee !== undefined) throw erreurCapturee;
  if (!resultat) throw new Error("Génération sans résultat");
  return resultat;
}

export async function verifierLangfuse(): Promise<string> {
  const baseUrl = process.env.LANGFUSE_BASE_URL;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;

  if (!baseUrl || !publicKey || !secretKey) {
    throw new Error("Variables LANGFUSE_BASE_URL, LANGFUSE_PUBLIC_KEY ou LANGFUSE_SECRET_KEY manquantes");
  }

  const reponse = await fetch(`${baseUrl}/api/public/projects`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`,
    },
    cache: "no-store",
  });

  if (!reponse.ok) {
    throw new Error(`Langfuse a répondu avec le statut ${reponse.status}`);
  }

  const donnees = await reponse.json();
  const projet = donnees.data?.[0]?.name ?? "inconnu";
  return `Projet « ${projet} » joignable sur ${new URL(baseUrl).host}`;
}