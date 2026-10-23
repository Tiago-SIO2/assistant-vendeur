"use client";

import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function BoutonDeconnexion() {
  const router = useRouter();

  async function deconnecter() {
    const supabase = creerClientNavigateur();
    await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <button
      onClick={deconnecter}
      className="rounded-full border border-sable bg-white px-4 py-1.5 text-sm font-medium transition hover:border-corail-500 hover:text-corail-600"
    >
      Se déconnecter
    </button>
  );
}