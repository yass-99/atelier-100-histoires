import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
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
  title: "Atelier des 100 histoires",
  description: "Réservez votre place à nos ateliers d'écriture et de récit.",
};

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
        <ClerkProvider appearance={clerkAppearance}>
          <MotionProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </MotionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
