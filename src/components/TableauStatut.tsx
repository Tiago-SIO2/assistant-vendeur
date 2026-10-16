"use client";

import { useState } from "react";
import type { Etat, Rapport } from "@/lib/statut";

const AFFICHAGE: Record<Etat, { libelle: string; classe: string }> = {
  operationnel: {
    libelle: "Opérationnel",
    classe: "border-green-300 bg-green-50 text-green-700",
  },
  degrade: {
    libelle: "Dégradé",
    classe: "border-yellow-300 bg-yellow-50 text-yellow-700",
  },
  en_panne: {
    libelle: "En panne",
    classe: "border-red-300 bg-red-50 text-red-700",
  },
};

function Badge({ etat }: { etat: Etat }) {
  const { libelle, classe } = AFFICHAGE[etat];
  return (
    <span className={`inline-block whitespace-nowrap rounded border px-3 py-1 ${classe}`}>
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
    <div className="mt-8">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <p className="text-sm text-gray-500">Statut général</p>
          <p className="mt-1 text-xl font-bold">{AFFICHAGE[rapport.global].libelle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500" suppressHydrationWarning>
            Vérifié le {new Date(rapport.verifieLe).toLocaleString("fr-FR")}
          </p>
          <button
            onClick={relancer}
            disabled={chargement}
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {chargement ? "Vérification…" : "Relancer les tests"}
          </button>
        </div>
      </div>

      {erreur && <p className="mt-4 text-red-600">{erreur}</p>}

      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="px-4 py-4 font-normal">Service</th>
            <th className="px-4 py-4 font-normal">Statut</th>
            <th className="px-4 py-4 font-normal">Latence</th>
            <th className="px-4 py-4 font-normal">Détail</th>
          </tr>
        </thead>
        <tbody>
          {rapport.resultats.map((r) => (
            <tr key={r.service} className="border-b align-top">
              <td className="px-4 py-5">
                <p className="font-semibold">{r.service}</p>
                <p className="mt-1 text-gray-500">{r.description}</p>
              </td>
              <td className="px-4 py-5">
                <Badge etat={r.etat} />
              </td>
              <td className="whitespace-nowrap px-4 py-5">{r.dureeMs} ms</td>
              <td className="px-4 py-5">{r.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}