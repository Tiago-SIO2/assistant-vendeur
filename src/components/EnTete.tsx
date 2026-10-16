import Link from "next/link";
import BoutonDeconnexion from "@/components/BoutonDeconnexion";
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
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4 text-sm">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold">
            Assistant Vendeur
          </Link>
          {estAdmin(user.email) && (
            <Link href="/admin" className="text-gray-500 hover:underline">
              Administration
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-gray-500">{user.email}</span>
          <BoutonDeconnexion />
        </div>
      </div>
    </header>
  );
}