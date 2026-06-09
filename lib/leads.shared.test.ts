import { describe, expect, it } from "vitest";
import { drawDiscount, normalizeEmail } from "./leads.shared";

describe("normalizeEmail", () => {
  it("minuscules + trim", () => expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com"));
});

describe("drawDiscount", () => {
  it("−5 % : début de plage", () => expect(drawDiscount(() => 0.0)).toBe(5));
  it("borne 0.49 → 5", () => expect(drawDiscount(() => 0.49)).toBe(5));
  it("−10 % : 0.5", () => expect(drawDiscount(() => 0.5)).toBe(10));
  it("borne 0.89 → 10", () => expect(drawDiscount(() => 0.89)).toBe(10));
  it("−15 % : 0.95", () => expect(drawDiscount(() => 0.95)).toBe(15));
});
