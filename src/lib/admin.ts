import "server-only";

export function estAdmin(email: string | null | undefined): boolean {
  if (!email) return false;

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((adresse) => adresse.trim().toLowerCase())
    .filter((adresse) => adresse !== "");

  return admins.includes(email.toLowerCase());
}