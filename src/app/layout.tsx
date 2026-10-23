import type { Metadata } from "next";
import EnTete from "@/components/EnTete";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistant Vendeur",
  description: "Vos annonces de vêtements par l’IA : titre, description et prix en quelques mots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased">
        <EnTete />
        {children}
      </body>
    </html>
  );
}