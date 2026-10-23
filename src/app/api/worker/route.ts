import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { FORMAT_UUID } from "@/lib/annonce";
import { genererAnnonce } from "@/lib/generer-annonce";
import { ErreurIA } from "@/lib/ia";
import { NOMBRE_RELANCES } from "@/lib/qstash";
import { creerClientAdmin } from "@/lib/supabase/admin";

export const maxDuration = 60;

function estTemporaire(erreur: unknown): boolean {
  if (erreur instanceof ErreurIA) {
    return erreur.status === 429 || erreur.status === 503 || erreur.status === 504;
  }
  return erreur instanceof Error && (erreur.name === "TimeoutError" || erreur.name === "TypeError");
}

async function traiter(request: Request) {
  const body = await request.json();
  const itemId = typeof body.item_id === "string" ? body.item_id : "";

  if (!FORMAT_UUID.test(itemId)) {
    return Response.json({ erreur: "Message invalide." }, { status: 400 });
  }

  // Aucun utilisateur connecté ici : c'est QStash qui appelle, donc client admin
  const supabase = creerClientAdmin();

  const { data: item } = await supabase
    .from("items")
    .select("id, mots_cles, statut")
    .eq("id", itemId)
    .maybeSingle();

  // Idempotence : si le message arrive deux fois, on ne régénère pas
  if (!item || item.statut !== "en_attente") {
    return Response.json({ ignore: true });
  }

  try {
    const { annonce } = await genererAnnonce(item.mots_cles);

    await supabase
      .from("items")
      .update({
        titre: annonce.titre,
        description: annonce.description,
        prix_estime: annonce.prix_estime,
        marque: annonce.marque,
        taille: annonce.taille,
        couleur: annonce.couleur,
        etat: annonce.etat,
        hashtags: annonce.hashtags,
        statut: "termine",
      })
      .eq("id", itemId)
      .eq("statut", "en_attente");

    return Response.json({ statut: "termine" });
  } catch (erreur) {
    const relances = Number(request.headers.get("Upstash-Retried") ?? "0");

    // Erreur passagère et relances restantes : code 500 pour que QStash réessaie plus tard
    if (estTemporaire(erreur) && relances < NOMBRE_RELANCES) {
      console.warn(`Erreur passagère, relance ${relances + 1}/${NOMBRE_RELANCES} :`, erreur);
      return Response.json({ erreur: "Réessai demandé." }, { status: 500 });
    }

    // Erreur définitive : on l'indique sur l'article et on arrête les relances
    console.error("Génération abandonnée :", erreur);
    await supabase
      .from("items")
      .update({ statut: "erreur" })
      .eq("id", itemId)
      .eq("statut", "en_attente");

    return Response.json({ statut: "erreur" });
  }
}

// Refuse tout appel qui n'est pas signé par QStash
export const POST = verifySignatureAppRouter(traiter);