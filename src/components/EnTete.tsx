import Link from "next/link";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
import Logo from "@/components/Logo";
import { estAdmin } from "@/lib/admin";
import { creerClientServeur } from "@/lib/supabase/server";

export default async function EnTete() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-sable bg-creme/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/">
          <Logo taille={40} />
        </Link>

        <div className="flex items-center gap-3">
          {estAdmin(user.email) && (
            <Link
              href="/admin"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-encre/70 hover:bg-sable sm:block"
            >
              Administration
            </Link>
          )}
          <span className="hidden text-sm text-encre/60 md:block">{user.email}</span>
          <BoutonDeconnexion />
        </div>
      </div>
    </header>
  );
}