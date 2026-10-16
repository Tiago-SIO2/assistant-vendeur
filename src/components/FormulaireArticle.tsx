"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LIMITES, PHOTOS } from "@/lib/annonce";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function FormulaireArticle({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const [motsCles, setMotsCles] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const longueur = motsCles.trim().length;
  const valide = longueur >= LIMITES.motsClesMin && longueur <= LIMITES.motsClesMax;

  function choisirPhoto(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0] ?? null;
    setErreur("");

    if (apercu) URL.revokeObjectURL(apercu);
    setPhoto(null);
    setApercu(null);

    if (!fichier) return;

    if (!PHOTOS.extensions[fichier.type]) {
      setErreur("Formats acceptés : JPEG, PNG ou WebP.");
      e.target.value = "";
      return;
    }
    if (fichier.size > PHOTOS.tailleMaxOctets) {
      setErreur("La photo dépasse 5 Mo.");
      e.target.value = "";
      return;
    }

    setPhoto(fichier);
    setApercu(URL.createObjectURL(fichier));
  }

  function retirerPhoto() {
    if (apercu) URL.revokeObjectURL(apercu);
    setPhoto(null);
    setApercu(null);
  }

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");

    const supabase = creerClientNavigateur();
    let photoPath: string | null = null;

    try {
      // 1. Envoi de la photo directement dans Supabase Storage, dans le dossier de l'utilisateur
      if (photo) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setErreur("Ta session a expiré, reconnecte-toi.");
          return;
        }

        const extension = PHOTOS.extensions[photo.type];
        photoPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage
          .from(PHOTOS.bucket)
          .upload(photoPath, photo, { contentType: photo.type, upsert: false });

        if (error) {
          console.error(error);
          setErreur("L’envoi de la photo a échoué.");
          return;
        }
      }

      // 2. Génération et enregistrement de l'annonce
      const reponse = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection_id: collectionId,
          mots_cles: motsCles,
          photo_path: photoPath,
        }),
      });
      const donnees = await reponse.json();

      if (!reponse.ok) {
        // On ne laisse pas une photo orpheline dans le stockage
        if (photoPath) await supabase.storage.from(PHOTOS.bucket).remove([photoPath]);
        setErreur(donnees.erreur ?? "Une erreur est survenue.");
        return;
      }

      setMotsCles("");
      retirerPhoto();
      router.refresh();
    } catch {
      if (photoPath) await supabase.storage.from(PHOTOS.bucket).remove([photoPath]);
      setErreur("Impossible de contacter le serveur.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mt-6">
      <form onSubmit={envoyer} className="flex flex-col gap-4">
        <div>
          <label htmlFor="mots_cles" className="block font-medium">
            Mots-clés du vêtement
          </label>
          <textarea
            id="mots_cles"
            value={motsCles}
            onChange={(e) => setMotsCles(e.target.value)}
            maxLength={LIMITES.motsClesMax}
            placeholder="Exemple : Jean Levi's 501 vintage bleu taille 40 bon état"
            className="mt-1 h-28 w-full rounded border p-2"
          />
          <p
            className={`mt-1 text-sm ${
              longueur === 0 || valide ? "text-gray-500" : "text-red-600"
            }`}
          >
            {longueur} caractères (entre {LIMITES.motsClesMin} et {LIMITES.motsClesMax})
          </p>
        </div>

        <div>
          <p className="font-medium">Photo (facultative)</p>
          {apercu ? (
            <div className="mt-2 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={apercu} alt="Aperçu de la photo" className="h-24 w-24 rounded-lg object-cover" />
              <button type="button" onClick={retirerPhoto} className="text-sm text-red-500 underline">
                Retirer la photo
              </button>
            </div>
          ) : (
            <label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 text-sm text-gray-500 hover:border-teal-500 hover:text-teal-600">
              Choisir une photo (JPEG, PNG ou WebP, 5 Mo max)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={choisirPhoto}
                className="hidden"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={!valide || chargement}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {chargement ? "Génération en cours…" : "Générer l’annonce"}
        </button>
      </form>

      {erreur && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">{erreur}</p>
      )}
    </div>
  );
}