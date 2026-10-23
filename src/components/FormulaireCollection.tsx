"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LIMITES } from "@/lib/annonce";

export default function FormulaireCollection() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function creer(e: FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    try {
      const reponse = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom }),
      });
      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur ?? "Une erreur est survenue.");
        return;
      }
      setNom("");
      router.refresh();
    } catch {
      setErreur("Impossible de contacter le serveur.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <form onSubmit={creer} className="mt-6">
      <div className="flex gap-2 rounded-full border border-sable bg-white p-1.5 pl-5 transition focus-within:border-sauge-500 focus-within:ring-4 focus-within:ring-sauge-100">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          maxLength={LIMITES.nomCollectionMax}
          placeholder="Nouvelle collection, ex : Vide-dressing printemps"
          className="flex-1 bg-transparent outline-none placeholder:text-encre/40"
        />
        <button
          type="submit"
          disabled={!nom.trim() || chargement}
          className="rounded-full bg-sauge-600 px-5 py-2.5 font-medium text-white transition hover:bg-sauge-700 disabled:opacity-40"
        >
          Créer
        </button>
      </div>
      {erreur && <p className="mt-2 pl-5 text-sm text-corail-600">{erreur}</p>}
    </form>
  );
}