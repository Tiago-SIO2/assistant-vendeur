import Image from "next/image";

export default function Logo({
  taille = 44,
  avecTexte = true,
  clair = false,
}: {
  taille?: number;
  avecTexte?: boolean;
  clair?: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      <span
        className="relative shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-sable"
        style={{ width: taille, height: taille }}
      >
        <Image
          src="/logo.jpg"
          alt="Logo Assistant Vendeur"
          fill
          sizes={`${taille}px`}
          className="object-cover"
          priority
        />
      </span>
      {avecTexte && (
        <span className={`font-titre text-xl font-semibold tracking-tight ${clair ? "text-creme" : "text-encre"}`}>
          Assistant <span className={clair ? "text-or-500" : "text-sauge-600"}>Vendeur</span>
        </span>
      )}
    </span>
  );
}