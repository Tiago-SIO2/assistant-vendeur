import { LIMITES } from "@/lib/annonce";
import { creerClientServeur } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ erreur: "Vous devez être connecté." }, { status: 401 });
  }

  const body = await request.json();
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";

  if (!nom || nom.length > LIMITES.nomCollectionMax) {
    return Response.json(
      { erreur: `Le nom est obligatoire (${LIMITES.nomCollectionMax} caractères maximum).` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({ nom })
    .select("id, nom, created_at")
    .single();

  if (error) {
    console.error("Erreur lors de la création de la collection :", error);
    return Response.json(
      { erreur: "La collection n'a pas pu être créée. Réessayez plus tard." },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 201 });
}