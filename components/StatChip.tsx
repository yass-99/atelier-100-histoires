import type { LucideIcon } from "lucide-react";

export function StatChip({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="stat-chip">
      <Icon className="h-5 w-5 text-brand-ink" strokeWidth={1.8} aria-hidden />
      <span className="font-display text-sm font-extrabold leading-tight">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}
