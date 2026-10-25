import { estAdmin } from "@/lib/admin";
import { CONTROLES } from "@/lib/controles";
import { executerControle, pireEtat, type Rapport } from "@/lib/statut";
import { creerClientServeur } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ erreur: "Authentification requise." }, { status: 401 });
  }
  if (!estAdmin(user.email)) {
    return Response.json({ erreur: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  // Tous les contrôles en parallèle : la durée totale est celle du plus lent
  const resultats = await Promise.all(CONTROLES.map(executerControle));
  const rapport: Rapport = {
    global: pireEtat(resultats),
    verifieLe: new Date().toISOString(),
    resultats,
  };

  return Response.json(rapport);
}