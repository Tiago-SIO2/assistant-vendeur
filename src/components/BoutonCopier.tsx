"use client";

import { useState } from "react";

export default function BoutonCopier({ texte }: { texte: string }) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      setCopie(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copier}
      className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        copie ? "bg-sauge-600 text-white" : "bg-encre text-creme hover:bg-sauge-700"
      }`}
    >
      {copie ? "Annonce copiée ✓" : "Copier l’annonce"}
    </button>
  );
}