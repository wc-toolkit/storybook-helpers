import { describe, expect, it } from "vitest";
import { isCategoryEnabled } from "../../src/adapters/categories.js";

describe("isCategoryEnabled", () => {
  it("enables categories when no order is configured", () => {
    expect(isCategoryEnabled("slots", [], {})).toBe(true);
  });

  it("limits categories to an explicit order, including an empty order", () => {
    expect(isCategoryEnabled("slots", [], { categoryOrder: ["slots"] })).toBe(
      true,
    );
    expect(isCategoryEnabled("events", [], { categoryOrder: ["slots"] })).toBe(
      false,
    );
    expect(isCategoryEnabled("slots", [], { categoryOrder: [] })).toBe(false);
  });

  it("gives exclusions precedence over the configured order", () => {
    expect(
      isCategoryEnabled("slots", ["slots"], { categoryOrder: ["slots"] }),
    ).toBe(false);
  });
});
