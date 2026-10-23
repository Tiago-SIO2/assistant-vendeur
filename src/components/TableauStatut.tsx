"use client";

import { useState } from "react";
import type { Etat, Rapport } from "@/lib/statut";

const AFFICHAGE: Record<Etat, { libelle: string; classe: string }> = {
  operationnel: { libelle: "Opérationnel", classe: "bg-sauge-50 text-sauge-700 ring-sauge-100" },
  degrade: { libelle: "Dégradé", classe: "bg-or-100 text-encre ring-or-500/40" },
  en_panne: { libelle: "En panne", classe: "bg-corail-50 text-corail-600 ring-corail-500/40" },
};

function Badge({ etat }: { etat: Etat }) {
  const { libelle, classe } = AFFICHAGE[etat];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ring-1 ${classe}`}>
      {libelle}
    </span>
  );
}

export default function TableauStatut({ rapportInitial }: { rapportInitial: Rapport }) {
  const [rapport, setRapport] = useState(rapportInitial);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function relancer() {
    setChargement(true);
    setErreur("");
    try {
      const reponse = await fetch("/api/admin/statut", { cache: "no-store" });
      if (!reponse.ok) {
        setErreur(`La vérification a échoué (code ${reponse.status}).`);
        return;
      }
      setRapport(await reponse.json());
    } catch {
      setErreur("Impossible de contacter le serveur.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-sable bg-white">
      <div className="flex flex-col gap-4 border-b border-sable p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-encre/60">Statut général</p>
          <div className="mt-2">
            <Badge etat={rapport.global} />
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-encre/60" suppressHydrationWarning>
            Vérifié le {new Date(rapport.verifieLe).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}
          </p>
          <button
            onClick={relancer}
            disabled={chargement}
            className="mt-2 rounded-full bg-sauge-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sauge-700 disabled:opacity-50"
          >
            {chargement ? "Vérification…" : "Relancer les tests"}
          </button>
        </div>
      </div>

      {erreur && <p className="px-6 pt-4 text-corail-600">{erreur}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-creme text-left text-encre/60">
              <th className="px-6 py-3 font-medium">Service</th>
              <th className="px-6 py-3 font-medium">Statut</th>
              <th className="px-6 py-3 font-medium">Latence</th>
              <th className="px-6 py-3 font-medium">Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sable">
            {rapport.resultats.map((r) => (
              <tr key={r.service} className="align-top">
                <td className="px-6 py-4">
                  <p className="font-semibold">{r.service}</p>
                  <p className="mt-0.5 text-encre/60">{r.description}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge etat={r.etat} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-mono">{r.dureeMs} ms</td>
                <td className="px-6 py-4 text-encre/80">{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}