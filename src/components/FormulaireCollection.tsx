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
    <form onSubmit={creer} className="mt-6 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          maxLength={LIMITES.nomCollectionMax}
          placeholder="Nom de la collection (ex : Vide-dressing printemps)"
          className="flex-1 rounded border p-2"
        />
        <button
          type="submit"
          disabled={!nom.trim() || chargement}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Créer
        </button>
      </div>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
    </form>
  );
}