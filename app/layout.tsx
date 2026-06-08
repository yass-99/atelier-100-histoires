import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import type { Metadata, Viewport } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/motion";
import { clerkAppearance } from "@/components/clerk-appearance";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Atelier aux 100 histoires",
  description: "Réservez votre place à nos ateliers d'écriture et de récit.",
};

export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${nunito.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <ClerkProvider localization={frFR} appearance={clerkAppearance}>
          <MotionProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-on-ink focus:font-bold">Aller au contenu principal</a>
            <Header />
            <div id="main-content" className="flex-1">{children}</div>
            <Footer />
          </MotionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
