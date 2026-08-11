import { describe, it, expect, beforeAll } from "vitest";
import { makeComponent } from "../test/helpers/make-component.js";
import type { Package } from "custom-elements-manifest";

const component = makeComponent({
  fields: [
    { name: "label", type: { text: "string" } },
    { name: "count", type: { text: "number" }, default: "0" },
    { name: "data", type: { text: "{ foo: 'bar' }" } },
  ],
  attributes: [{ name: "label", fieldName: "label" }],
  slots: [{ name: "default", description: "default slot" }],
  cssParts: [{ name: "foo" }],
  cssStates: [{ name: "open" }],
});

const manifest = {
  schemaVersion: "1.0.0",
  modules: [
    {
      kind: "javascript-module",
      path: "test.js",
      declarations: [
        {
          kind: "class",
          customElement: true,
          ...(component as Record<string, unknown>),
        },
      ],
      exports: [],
    },
  ],
} as unknown as Package;

describe("getStorybookHelpers > getArgs", () => {
  let args: Record<string, unknown>;

  beforeAll(async () => {
    (globalThis as Record<string, unknown>).window = globalThis;
    (
      globalThis as Record<string, unknown>
    ).__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__ = manifest;
    const mod = await import("./storybook-helpers.js");
    args = mod.getStorybookHelpers("test-element").args;
  });

  it("initializes args without a default value to an empty string", () => {
    expect(args["label"]).toBe("");
    expect(args["default-slot"]).toBe("");
    expect(args["foo-part"]).toBe("");
    expect(args["open-state"]).toBe("");
    expect(args["data"]).toBe("");
  });

  it("preserves falsy default values", () => {
    expect(args["count"]).toBe(0);
  });
});
