import { describe, expect, test } from "vitest";
import { getFlag } from "./flags.js";

describe("getFlag", () => {
  test("returns the Portuguese flag for CS registration", () => {
    expect(getFlag("CS-ABC")).toBe("🇵🇹");
  });

  test("returns the Canadian flag for C registration", () => {
    expect(getFlag("C-ABC")).toBe("🇨🇦");
  });

  test("returns an empty string when registration is missing", () => {
    expect(getFlag("")).toBe("");
    expect(getFlag(null)).toBe("");
  });
});
