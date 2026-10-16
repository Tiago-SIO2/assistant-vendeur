"use client";

import { useState, type FormEvent } from "react";
import { LIMITES, type Annonce } from "@/lib/annonce";

export default function FormulaireArticle() {
  const [motsCles, setMotsCles] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [annonce, setAnnonce] = useState<Annonce | null>(null);

  const longueur = motsCles.trim().length;
  const valide = longueur >= LIMITES.motsClesMin && longueur <= LIMITES.motsClesMax;

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    setAnnonce(null);

    try {
      const reponse = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mots_cles: motsCles }),
      });
      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Une erreur est survenue.");
        return;
      }
      setAnnonce(donnees);
    } catch {
      setErreur("Impossible de contacter le serveur.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mt-6">
      <form onSubmit={envoyer} className="flex flex-col gap-4">
        <div>
          <label htmlFor="mots_cles" className="block font-medium">
            Mots-clés du vêtement
          </label>
          <textarea
            id="mots_cles"
            value={motsCles}
            onChange={(e) => setMotsCles(e.target.value)}
            maxLength={LIMITES.motsClesMax}
            placeholder="Exemple : Jean Levi's 501 vintage bleu taille 40 bon état"
            className="mt-1 h-28 w-full rounded border p-2"
          />
          <p
            className={`mt-1 text-sm ${
              longueur === 0 || valide ? "text-gray-500" : "text-red-600"
            }`}
          >
            {longueur} caractères (entre {LIMITES.motsClesMin} et {LIMITES.motsClesMax})
          </p>
        </div>

        <button
          type="submit"
          disabled={!valide || chargement}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {chargement ? "Génération en cours…" : "Générer l’annonce"}
        </button>
      </form>

      {erreur && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {erreur}
        </p>
      )}

      {annonce && (
        <pre className="mt-4 whitespace-pre-wrap rounded bg-gray-100 p-4 text-sm text-gray-800">
          {JSON.stringify(annonce, null, 2)}
        </pre>
      )}
    </div>
  );
}