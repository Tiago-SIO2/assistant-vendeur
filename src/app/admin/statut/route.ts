import { verifierTousLesServices } from "@/lib/controles";

export const dynamic = "force-dynamic";

export async function GET() {
  // Réservé au local tant que l'authentification n'existe pas
if (process.env.NODE_ENV === "production" && process.env.ADMIN_PUBLIC !== "true") {
  return Response.json({ erreur: "Introuvable." }, { status: 404 });
}

  const rapport = await verifierTousLesServices();
  return Response.json(rapport);
}