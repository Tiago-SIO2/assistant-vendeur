import { estAdmin } from "@/lib/admin";
import { verifierTousLesServices } from "@/lib/controles";
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

  const rapport = await verifierTousLesServices();
  return Response.json(rapport);
}