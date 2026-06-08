import { describe, it, expect } from "vitest";
import { dayKey, weekdayShort, groupByDay } from "./dates";
import type { Session } from "./types";

const mk = (id: string, iso: string): Session => ({
  id, titre: id, description: "", date_heure: iso, duree: 60, lieu: "Paris",
  capacite: 10, prix_cents: 3500, statut: "publie", places_reservees: 0,
  image_url: null, created_at: iso,
});

describe("dates", () => {
  it("dayKey = AAAA-MM-JJ en heure locale", () => {
    expect(dayKey("2026-06-09T14:30:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("weekdayShort renvoie un jour FR court sans point", () => {
    expect(weekdayShort("2026-06-13T10:00:00").toLowerCase()).toContain("sam");
  });
  it("groupByDay regroupe et trie par jour croissant", () => {
    const a = mk("a", "2026-06-13T10:00:00");
    const b = mk("b", "2026-06-09T10:00:00");
    const c = mk("c", "2026-06-13T18:00:00");
    const groups = groupByDay([a, b, c]);
    expect(groups.map((g) => g.key)).toEqual(["2026-06-09", "2026-06-13"]);
    // jour 2026-06-13 : a puis c (ordre d'insertion préservé)
    expect(groups[1].sessions.map((s) => s.id)).toEqual(["a", "c"]);
  });
});
