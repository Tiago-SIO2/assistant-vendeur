import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

const limiteParMinute = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "assistant-vendeur:minute",
});

const limiteParJour = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(50, "1 d"),
  prefix: "assistant-vendeur:jour",
});

export type ResultatLimite =
  | { autorise: true }
  | { autorise: false; secondesAvantReprise: number };

export async function verifierLimite(userId: string): Promise<ResultatLimite> {
  const [minute, jour] = await Promise.all([
    limiteParMinute.limit(userId),
    limiteParJour.limit(userId),
  ]);

  const bloquant = !minute.success ? minute : !jour.success ? jour : null;
  if (!bloquant) return { autorise: true };

  return {
    autorise: false,
    secondesAvantReprise: Math.max(1, Math.ceil((bloquant.reset - Date.now()) / 1000)),
  };
}

export function formaterDelai(secondes: number): string {
  if (secondes < 60) return `${secondes} s`;
  if (secondes < 3600) return `${Math.ceil(secondes / 60)} min`;
  return `${Math.ceil(secondes / 3600)} h`;
}