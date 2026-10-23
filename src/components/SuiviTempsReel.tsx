"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function SuiviTempsReel({ collectionId }: { collectionId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = creerClientNavigateur();
    let canal: ReturnType<typeof supabase.channel> | null = null;
    let actif = true;

    async function demarrer() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!actif || !session) return;

      // Le temps réel utilise la session : la RLS filtre les événements reçus
      await supabase.realtime.setAuth(session.access_token);

      canal = supabase
        .channel(`items-${collectionId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "items",
            filter: `collection_id=eq.${collectionId}`,
          },
          () => router.refresh()
        )
        .subscribe();
    }

    void demarrer();

    return () => {
      actif = false;
      if (canal) void supabase.removeChannel(canal);
    };
  }, [collectionId, router]);

  return null;
}