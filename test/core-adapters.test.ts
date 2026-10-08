// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import {
  getStorybookHelpers,
  setStorybookHelpersConfig,
} from "../src/storybook-helpers.js";
import { getStorybookHelpers as getLitHelpers } from "../src/adapters/lit/index.js";
import { getStorybookHelpers as getFastHelpers } from "../src/adapters/fast/index.js";
import { ViewTemplate } from "@microsoft/fast-element";
import { isTemplateResult } from "lit/directive-helpers.js";
import { logEvent } from "../src/storybook-helpers.js";
import type { Package } from "custom-elements-manifest";

function manifest(label: string): Package {
  return {
    schemaVersion: "1.0.0",
    modules: [
      {
        kind: "javascript-module",
        path: "greeting.js",
        declarations: [
          {
            kind: "class",
            name: "Greeting",
            tagName: "test-greeting",
            customElement: true,
            members: [
              {
                kind: "field",
                name: "label",
                type: { text: "string" },
                default: JSON.stringify(label),
              },
            ],
            attributes: [{ name: "label", fieldName: "label" }],
            events: [{ name: "change", type: { text: "Event" } }],
          },
        ],
      },
    ],
  };
}

afterEach(() => {
  delete globalThis.__WC_STORYBOOK_HELPERS_CONFIG__;
  Reflect.deleteProperty(globalThis, "__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__");
});

describe("Shared getStorybookHelpers", () => {
  it("preserves controls omitted from categoryOrder, including an empty order", () => {
    for (const categoryOrder of [[], ["events"]] as const) {
      setStorybookHelpersConfig({
        manifest: manifest("Hello"),
        categoryOrder: [...categoryOrder],
      });
      for (const getHelpers of [
        getStorybookHelpers,
        getLitHelpers,
        getFastHelpers,
      ]) {
        const helpers = getHelpers("test-greeting");
        expect(helpers.args.label).toBe("Hello");
        expect(helpers.argTypes).toHaveProperty("label");
      }
    }
  });

  it("returns equivalent core metadata and event logging across adapters", () => {
    setStorybookHelpersConfig({ manifest: manifest("Hello") });
    const core = getStorybookHelpers("test-greeting");
    const lit = getLitHelpers("test-greeting");
    const fast = getFastHelpers("test-greeting");
    for (const adapter of [lit, fast]) {
      expect(adapter.args).toEqual(core.args);
      expect(adapter.argTypes).toEqual(core.argTypes);
      expect(Object.keys(adapter.reactArgs)).toEqual(
        Object.keys(core.reactArgs),
      );
      for (const [key, value] of Object.entries(core.reactArgs)) {
        if (typeof value === "function") {
          expect(adapter.reactArgs[key]).toBeTypeOf("function");
        } else {
          expect(adapter.reactArgs[key]).toEqual(value);
        }
      }
      expect(adapter.reactArgTypes).toEqual(core.reactArgTypes);
      expect(adapter.events).toEqual(core.events);
      expect(adapter.logEvent).toBe(core.logEvent);
    }
    expect(core.events).toEqual(["change"]);
    expect(core.logEvent).toBeTypeOf("function");
    expect(core.logEvent).toBe(logEvent);
    expect(core).not.toHaveProperty("template");
    expect(core).not.toHaveProperty("styleTemplate");
    expect(core).not.toHaveProperty("render");
  });

  for (const [name, getHelpers] of [
    ["core", getStorybookHelpers],
    ["Lit", getLitHelpers],
    ["FAST", getFastHelpers],
  ] as const) {
    it(`${name}: resolves per-helper, configured, then legacy manifests`, () => {
      Reflect.set(
        globalThis,
        "__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__",
        manifest("legacy"),
      );
      expect(getHelpers("test-greeting").args.label).toBe("legacy");
      setStorybookHelpersConfig({ manifest: manifest("configured") });
      expect(getHelpers("test-greeting").args.label).toBe("configured");
      expect(
        getHelpers("test-greeting", { manifest: manifest("local") }).args.label,
      ).toBe("local");
      expect(getHelpers("test-greeting").args.label).toBe("configured");
    });

    it(`${name}: reads updated config synchronously and respects category exclusion`, () => {
      setStorybookHelpersConfig({
        manifest: manifest("Hello"),
        categoryOrder: ["events", "attributes"],
      });
      expect(
        getHelpers("test-greeting", {
          excludeCategories: ["attributes"],
        }).args,
      ).not.toHaveProperty("label");
      setStorybookHelpersConfig({ manifest: manifest("Updated") });
      expect(getHelpers("test-greeting").args.label).toBe("Updated");
    });

    it(`${name}: reports missing manifest and unknown tags`, () => {
      expect(() => getHelpers("test-greeting")).toThrow(
        "Custom Elements Manifest not found",
      );
      expect(() =>
        getHelpers("missing-tag", { manifest: manifest("Hello") }),
      ).toThrow('A component with the tag name "missing-tag" was not found');
    });
  }
});

describe("Lit > getStorybookHelpers", () => {
  it("provides native Lit templates without an HTML-renderer bridge", () => {
    const lit = getLitHelpers("test-greeting", { manifest: manifest("Hello") });
    expect(isTemplateResult(lit.template())).toBe(true);
    expect(lit.styleTemplate({})).toBe("");
    expect(lit).not.toHaveProperty("render");
  });
});

describe("FAST > getStorybookHelpers", () => {
  it("provides native FAST templates and an HTML-renderer bridge", () => {
    const fast = getFastHelpers("test-greeting", {
      manifest: manifest("Hello"),
    });
    expect(fast.template()).toBeInstanceOf(ViewTemplate);
    expect(fast.styleTemplate({})).toBe("");
    expect(fast.render).toBeTypeOf("function");
  });
});
