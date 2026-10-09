import { describe, it, expect, beforeAll, vi } from "vitest";
import { makeComponent } from "../../helpers/make-component.js";

async function importFreshHtmlTemplates() {
  (
    globalThis as { __WC_STORYBOOK_HELPERS_CONFIG__?: unknown }
  ).__WC_STORYBOOK_HELPERS_CONFIG__ = {
    categoryOrder: ["cssParts", "cssStates"],
  };
  vi.resetModules();
  const mod = await import("../../../src/adapters/lit/templates.js");
  await new Promise((resolve) => setTimeout(resolve));
  return mod;
}

function renderedHtml(result: unknown): string {
  return (result as { values: string[] }).values?.[0] ?? (result as string);
}

describe("getStyleTemplate > CSS parts", () => {
  let getStyleTemplate: typeof import("../../../src/adapters/lit/templates.js").getStyleTemplate;

  beforeAll(async () => {
    ({ getStyleTemplate } = await importFreshHtmlTemplates());
  });

  it("does not throw when a declared CSS part has no corresponding arg", () => {
    const component = makeComponent({ cssParts: [{ name: "foo" }] });
    expect(() => getStyleTemplate(component, {})).not.toThrow();
  });

  it("omits the ::part rule when its arg is absent", () => {
    const component = makeComponent({ cssParts: [{ name: "foo" }] });
    const html = renderedHtml(getStyleTemplate(component, {}));
    expect(html).not.toContain("::part(foo)");
  });

  it("still emits the ::part rule when its arg is set", () => {
    const component = makeComponent({ cssParts: [{ name: "foo" }] });
    const html = renderedHtml(
      getStyleTemplate(component, { "foo-part": "color: red" }),
    );
    expect(html).toContain("test-element::part(foo)");
    expect(html).toContain("color: red");
  });
});

describe("getStyleTemplate > CSS states", () => {
  let getStyleTemplate: typeof import("../../../src/adapters/lit/templates.js").getStyleTemplate;

  beforeAll(async () => {
    ({ getStyleTemplate } = await importFreshHtmlTemplates());
  });

  describe("getTemplate > disabled observation", () => {
    it("can generate a template outside Storybook when observation is disabled", async () => {
      globalThis.__WC_STORYBOOK_HELPERS_CONFIG__ = {
        disableArgObserver: true,
      };
      vi.resetModules();
      const { getTemplate } = await import(
        "../../../src/adapters/lit/templates.js"
      );
      await new Promise((resolve) => setTimeout(resolve));

      try {
        expect(() => getTemplate(makeComponent({}), {})).not.toThrow();
      } finally {
        delete globalThis.__WC_STORYBOOK_HELPERS_CONFIG__;
      }
    });

    describe("getStyleTemplate > legacy category filtering", () => {
      it("keeps styles disabled when the captured config has no category order", async () => {
        globalThis.__WC_STORYBOOK_HELPERS_CONFIG__ = {};
        vi.resetModules();
        const { getStyleTemplate } = await import(
          "../../../src/adapters/lit/templates.js"
        );
        await new Promise((resolve) => setTimeout(resolve));

        try {
          expect(
            getStyleTemplate(makeComponent({ cssParts: [{ name: "foo" }] }), {
              "foo-part": "color: red",
            }),
          ).toBe("");
        } finally {
          delete globalThis.__WC_STORYBOOK_HELPERS_CONFIG__;
        }
      });
    });
  });

  it("does not throw when a declared CSS state has no corresponding arg", () => {
    const component = makeComponent({ cssStates: [{ name: "open" }] });
    expect(() => getStyleTemplate(component, {})).not.toThrow();
  });

  it("omits the :state rule when its arg is absent", () => {
    const component = makeComponent({ cssStates: [{ name: "open" }] });
    const html = renderedHtml(getStyleTemplate(component, {}));
    expect(html).not.toContain(":state(open)");
  });

  it("still emits the :state rule when its arg is set", () => {
    const component = makeComponent({ cssStates: [{ name: "open" }] });
    const html = renderedHtml(
      getStyleTemplate(component, { "open-state": "display: block" }),
    );
    expect(html).toContain("test-element:state(open)");
    expect(html).toContain("display: block");
  });
});
