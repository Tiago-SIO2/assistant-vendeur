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
      className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
    >
      {copie ? "Annonce copiée !" : "Copier l’annonce"}
    </button>
  );
}