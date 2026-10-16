export type Etat = "operationnel" | "degrade" | "en_panne";

export type ResultatControle = {
  service: string;
  description: string;
  etat: Etat;
  dureeMs: number;
  detail: string;
};

export type Rapport = {
  global: Etat;
  verifieLe: string;
  resultats: ResultatControle[];
};

export type Controle = {
  service: string;
  description: string;
  verifier: () => Promise<string>;
};

const DELAI_MAX_MS = 5000;
const SEUIL_DEGRADE_MS = 2000;
const GRAVITE: Etat[] = ["operationnel", "degrade", "en_panne"];

export async function executerControle(controle: Controle): Promise<ResultatControle> {
  const debut = performance.now();
  let minuteur: ReturnType<typeof setTimeout> | undefined;

  try {
    const detail = await Promise.race([
      controle.verifier(),
      new Promise<never>((_, rejeter) => {
        minuteur = setTimeout(
          () => rejeter(new Error(`Pas de réponse après ${DELAI_MAX_MS / 1000} s`)),
          DELAI_MAX_MS
        );
      }),
    ]);
    const dureeMs = Math.round(performance.now() - debut);
    return {
      service: controle.service,
      description: controle.description,
      etat: dureeMs > SEUIL_DEGRADE_MS ? "degrade" : "operationnel",
      dureeMs,
      detail,
    };
  } catch (erreur) {
    return {
      service: controle.service,
      description: controle.description,
      etat: "en_panne",
      dureeMs: Math.round(performance.now() - debut),
      detail: erreur instanceof Error ? erreur.message : "Erreur inconnue",
    };
  } finally {
    clearTimeout(minuteur);
  }
}

export function pireEtat(resultats: ResultatControle[]): Etat {
  return resultats.reduce<Etat>(
    (pire, r) => (GRAVITE.indexOf(r.etat) > GRAVITE.indexOf(pire) ? r.etat : pire),
    "operationnel"
  );
}