import { describe, it, expect } from "vitest";
import { qrDataUrl } from "./qr";

describe("qr", () => {
  it("génère un data URL PNG", async () => {
    const url = await qrDataUrl("ABC123");
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
  });
});
