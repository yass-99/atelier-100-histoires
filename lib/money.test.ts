import { describe, it, expect } from "vitest";
import { formatEUR, euroToCents } from "./money";

// Normalise les espaces (Intl utilise un espace insécable avant €)
const norm = (s: string) => s.replace(/ | /g, " ");

describe("money", () => {
  it("formate des centimes en euros FR", () => {
    expect(norm(formatEUR(3500))).toBe("35,00 €");
    expect(norm(formatEUR(0))).toBe("0,00 €");
    expect(norm(formatEUR(2899))).toBe("28,99 €");
  });

  it("convertit euros -> centimes", () => {
    expect(euroToCents(35)).toBe(3500);
    expect(euroToCents(12.5)).toBe(1250);
    expect(euroToCents(0)).toBe(0);
  });
});
