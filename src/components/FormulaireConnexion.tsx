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
      <p className="mt-6 rounded border border-green-300 bg-green-50 p-4 text-green-800">
        Lien envoyé à <strong>{email}</strong>. Ouvre l’e-mail <strong>dans ce même navigateur</strong> et
        clique sur le lien pour te connecter.
      </p>
    );
  }

  return (
    <form onSubmit={envoyer} className="mt-6 flex flex-col gap-3">
      <label htmlFor="email" className="font-medium">
        Adresse e-mail
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="toi@exemple.com"
        className="rounded border p-2"
      />
      <button
        type="submit"
        disabled={etat === "envoi"}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {etat === "envoi" ? "Envoi…" : "Recevoir un lien de connexion"}
      </button>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
    </form>
  );
}