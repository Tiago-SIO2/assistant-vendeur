"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ETATS, LIMITES, PHOTOS, type Etat } from "@/lib/annonce";
import { creerClientNavigateur } from "@/lib/supabase/client";

const EXEMPLES = [
  "Jean Levi's 501 bleu taille 40",
  "Doudoune The North Face noire taille L",
  "Robe Zara fleurie verte taille M",
];

export default function FormulaireArticle({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const [motsCles, setMotsCles] = useState("");
  const [etat, setEtat] = useState<Etat | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const longueur = motsCles.trim().length;
  const valide =
    longueur >= LIMITES.motsClesMin && longueur <= LIMITES.motsClesMax && etat !== null;

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
      if (photo) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setErreur("Ta session a expiré, reconnecte-toi.");
          return;
        }
        photoPath = `${user.id}/${crypto.randomUUID()}.${PHOTOS.extensions[photo.type]}`;
        const { error } = await supabase.storage
          .from(PHOTOS.bucket)
          .upload(photoPath, photo, { contentType: photo.type, upsert: false });
        if (error) {
          console.error(error);
          setErreur("L’envoi de la photo a échoué.");
          return;
        }
      }

      const reponse = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection_id: collectionId,
          mots_cles: motsCles,
          etat,
          photo_path: photoPath,
        }),
      });
      const donnees = await reponse.json();

      if (!reponse.ok) {
        if (photoPath) await supabase.storage.from(PHOTOS.bucket).remove([photoPath]);
        setErreur(donnees.erreur ?? "Une erreur est survenue.");
        return;
      }

      setMotsCles("");
      setEtat(null);
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
    <div className="rounded-3xl border border-sable bg-white p-6">
      <p className="font-titre text-sm italic text-or-500">Nouvelle pièce</p>
      <h2 className="mt-1 font-titre text-2xl font-semibold">Décris ton vêtement</h2>

      <form onSubmit={envoyer} className="mt-5 flex flex-col gap-4">
        <div>
          <textarea
            aria-label="Mots-clés du vêtement"
            value={motsCles}
            onChange={(e) => setMotsCles(e.target.value)}
            maxLength={LIMITES.motsClesMax}
            placeholder="Marque, type, couleur, taille…"
            className="h-28 w-full resize-none rounded-2xl border border-sable bg-creme p-4 outline-none transition placeholder:text-encre/40 focus:border-sauge-500 focus:bg-white focus:ring-4 focus:ring-sauge-100"
          />
          <p className={`mt-1 text-xs ${longueur === 0 || longueur >= LIMITES.motsClesMin ? "text-encre/50" : "text-corail-600"}`}>
            {longueur} / {LIMITES.motsClesMax} caractères, minimum {LIMITES.motsClesMin}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXEMPLES.map((exemple) => (
            <button
              key={exemple}
              type="button"
              onClick={() => setMotsCles(exemple)}
              className="rounded-full border border-sable px-3 py-1 text-xs text-encre/70 transition hover:border-sauge-500 hover:text-sauge-700"
            >
              {exemple}
            </button>
          ))}
        </div>

        <fieldset>
          <legend className="text-sm font-medium">État du vêtement</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ETATS.map((option) => {
              const actif = etat === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => setEtat(option)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    actif
                      ? "border-sauge-600 bg-sauge-600 text-white"
                      : "border-sable text-encre/80 hover:border-sauge-500 hover:text-sauge-700"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {!etat && <p className="mt-1 text-xs text-encre/50">Choisis l’état pour continuer.</p>}
        </fieldset>

        {apercu ? (
          <div className="flex items-center gap-4 rounded-2xl border border-sable p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={apercu} alt="Aperçu de la photo" className="h-20 w-16 rounded-xl object-cover" />
            <div className="flex-1 text-sm">
              <p className="font-medium">Photo ajoutée</p>
              <button type="button" onClick={retirerPhoto} className="text-corail-600 hover:underline">
                Retirer
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-sable p-5 text-center transition hover:border-sauge-500 hover:bg-sauge-50">
            <span className="text-sm font-medium text-sauge-700">Ajouter une photo</span>
            <span className="mt-1 text-xs text-encre/50">JPEG, PNG ou WebP, 5 Mo maximum</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choisirPhoto} className="hidden" />
          </label>
        )}

        <button
          type="submit"
          disabled={!valide || chargement}
          className="flex items-center justify-center gap-2 rounded-full bg-sauge-600 px-4 py-3 font-semibold text-white transition hover:bg-sauge-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {chargement && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {chargement ? "Envoi en cours…" : "Générer l’annonce"}
        </button>
      </form>

      {erreur && (
        <p className="mt-4 rounded-2xl bg-corail-50 p-3 text-sm text-corail-600">{erreur}</p>
      )}
    </div>
  );
}