"use client";

import { useState, type FormEvent } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function FormulaireConnexion() {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<"saisie" | "envoi" | "envoye">("saisie");
  const [erreur, setErreur] = useState("");

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    setEtat("envoi");
    setErreur("");

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      console.error(error);
      setErreur("L’envoi du lien a échoué. Vérifie l’adresse ou réessaie dans quelques minutes.");
      setEtat("saisie");
      return;
    }
    setEtat("envoye");
  }

  if (etat === "envoye") {
    return (
      <div className="mt-8 rounded-3xl border border-sauge-100 bg-sauge-50 p-6">
        <p className="font-titre text-xl font-semibold text-sauge-700">Vérifie ta boîte mail</p>
        <p className="mt-2 text-sm text-encre/70">
          Lien envoyé à <strong>{email}</strong>. Ouvre-le dans ce même navigateur.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className="mt-8 flex flex-col gap-3">
      <label htmlFor="email" className="text-sm font-medium">
        Adresse e-mail
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="toi@exemple.com"
        className="rounded-full border border-sable bg-white px-5 py-3 outline-none transition focus:border-sauge-500 focus:ring-4 focus:ring-sauge-100"
      />
      <button
        type="submit"
        disabled={etat === "envoi"}
        className="mt-2 flex items-center justify-center gap-2 rounded-full bg-sauge-600 px-4 py-3 font-semibold text-white transition hover:bg-sauge-700 disabled:opacity-50"
      >
        {etat === "envoi" && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {etat === "envoi" ? "Envoi…" : "Recevoir mon lien"}
      </button>
      {erreur && <p className="text-sm text-corail-600">{erreur}</p>}
    </form>
  );
}