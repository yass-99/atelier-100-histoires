import type { Metadata } from "next";
import { AvisView } from "@/components/AvisView";

export const metadata: Metadata = {
  title: "Avis — ce que vivent nos participant·e·s",
  description:
    "Notes, témoignages et créations : découvrez ce que pensent les participant·e·s de nos ateliers créatifs, et pourquoi ils repartent fiers de leur création.",
};

export default function AvisPage() {
  return <AvisView />;
}
