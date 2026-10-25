import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lit UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN
export const redis = Redis.fromEnv();

// Nombre de générations autorisées par utilisateur et par heure : change ce chiffre pour régler la limite
export const QUOTA_GENERATIONS = 3;

const limiteurGenerations = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(QUOTA_GENERATIONS, "1 h"),
  prefix: "assistant-vendeur:generations",
});

export type ResultatLimite =
  | { autorise: true; restant: number }
  | { autorise: false; secondesAvantReprise: number };

export async function verifierLimite(userId: string): Promise<ResultatLimite> {
  const resultat = await limiteurGenerations.limit(userId);

  if (resultat.success) {
    return { autorise: true, restant: resultat.remaining };
  }

  return {
    autorise: false,
    secondesAvantReprise: Math.max(1, Math.ceil((resultat.reset - Date.now()) / 1000)),
  };
}

export function formaterDelai(secondes: number): string {
  if (secondes < 60) return `${secondes} s`;
  if (secondes < 3600) return `${Math.ceil(secondes / 60)} min`;
  return `${Math.ceil(secondes / 3600)} h`;
}