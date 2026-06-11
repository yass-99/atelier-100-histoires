import { describe, it, expect } from "vitest";
import { parseDevisInput, OCCASIONS } from "./devis.shared";

const valid = {
  prenom: "  Camille  ",
  email: "  Camille@Example.FR ",
  occasion: "evjf",
  nb_personnes: 10,
  type_atelier: "bijoux",
  dates_souhaitees: "un samedi de juillet",
  phone: " 0612345678 ",
  message: "  pour l'EVJF de ma sœur  ",
  source: "instagram",
};

describe("parseDevisInput", () => {
  it("accepte une demande complète et normalise email/prénom", () => {
    const r = parseDevisInput(valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.email).toBe("camille@example.fr");
    expect(r.value.prenom).toBe("Camille");
    expect(r.value.occasion).toBe("evjf");
    expect(r.value.nb_personnes).toBe(10);
    expect(r.value.phone).toBe("0612345678");
    expect(r.value.message).toBe("pour l'EVJF de ma sœur");
  });

  it("refuse un email manquant", () => {
    const r = parseDevisInput({ ...valid, email: undefined });
    expect(r.ok).toBe(false);
  });

  it("refuse un email invalide", () => {
    const r = parseDevisInput({ ...valid, email: "pas-un-email" });
    expect(r.ok).toBe(false);
  });

  it("refuse un prénom vide", () => {
    const r = parseDevisInput({ ...valid, prenom: "   " });
    expect(r.ok).toBe(false);
  });

  it("refuse une occasion hors enum", () => {
    const r = parseDevisInput({ ...valid, occasion: "mariage" });
    expect(r.ok).toBe(false);
  });

  it("refuse un nombre de personnes invalide quand fourni", () => {
    expect(parseDevisInput({ ...valid, nb_personnes: 0 }).ok).toBe(false);
    expect(parseDevisInput({ ...valid, nb_personnes: -3 }).ok).toBe(false);
    expect(parseDevisInput({ ...valid, nb_personnes: 2.5 }).ok).toBe(false);
  });

  it("accepte les champs optionnels absents (nuls)", () => {
    const r = parseDevisInput({ prenom: "Léa", email: "lea@test.fr", occasion: "autre" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.phone).toBeNull();
    expect(r.value.nb_personnes).toBeNull();
    expect(r.value.type_atelier).toBeNull();
    expect(r.value.dates_souhaitees).toBeNull();
    expect(r.value.message).toBeNull();
    expect(r.value.source).toBeNull();
  });

  it("refuse une entrée non-objet", () => {
    expect(parseDevisInput(null).ok).toBe(false);
    expect(parseDevisInput("nope").ok).toBe(false);
  });

  it("OCCASIONS couvre les 5 occasions attendues (les plus connues d'abord)", () => {
    expect(OCCASIONS.map((o) => o.value)).toEqual([
      "anniversaire",
      "entre_amis",
      "team_building",
      "evjf",
      "autre",
    ]);
  });
});
