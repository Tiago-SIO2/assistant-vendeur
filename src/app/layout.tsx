import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import EnTete from "@/components/EnTete";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

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
      <body className={`${geist.variable} ${fraunces.variable} min-h-screen font-sans antialiased`}>
        <EnTete />
        {children}
      </body>
    </html>
  );
}