import { describe, expect, it } from "vitest";
import { publicCibleLabel } from "./sessions.shared";

describe("publicCibleLabel", () => {
  it("adultes", () => expect(publicCibleLabel("adultes", null)).toBe("Adultes"));
  it("enfants sans âge", () => expect(publicCibleLabel("enfants", null)).toBe("Enfants"));
  it("enfants avec âge", () => expect(publicCibleLabel("enfants", 7)).toBe("Enfants · dès 7 ans"));
  it("tous publics sans âge", () => expect(publicCibleLabel("tous", null)).toBe("Tous publics"));
  it("tous publics avec âge", () => expect(publicCibleLabel("tous", 6)).toBe("Tous publics · dès 6 ans"));
  it("adultes ignore l'âge", () => expect(publicCibleLabel("adultes", 18)).toBe("Adultes"));
});
