import { Croissant, Utensils, Coffee, Wine, CakeSlice, Store } from "lucide-react";
import type { TypeLieu } from "@/lib/partenaire.shared";

/** Icône line-art (lucide) associée à chaque type de lieu partenaire. */
const ICON_BY_TYPE: Record<TypeLieu, typeof Croissant> = {
  boulangerie: Croissant,
  restaurant: Utensils,
  cafe: Coffee,
  bistrot: Wine,
  patisserie: CakeSlice,
  autre: Store,
};

export function LieuIcon({
  type,
  className,
  strokeWidth = 1.7,
}: {
  type: TypeLieu;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICON_BY_TYPE[type] ?? Store;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
