import { describe, it, expect, beforeAll, vi } from "vitest";
import { transformToScoped } from "./html-templates.js";
import { makeComponent } from "../test/helpers/make-component.js";

describe("transformToScoped", () => {
  it("wraps root tag rules with @scope and replaces tag with :scope", () => {
    const input = `my-element {\n  --card-border-color: #e50d0d;\n}`;
    const out = transformToScoped(input, "my-element");
    expect(out.startsWith("@scope (my-element)")).toBe(true);
    expect(out).toContain("\n  :scope {");
    expect(out).toContain("--card-border-color: #e50d0d");
  });

  it("replaces ::part and :state selectors correctly", () => {
    const input = `my-element::part(foo) { color: red }\nmy-element:state(open) { display: block }`;
    const out = transformToScoped(input, "my-element");
    expect(out).toContain(":scope::part(foo)");
    expect(out).toContain(":scope:state(open)");
  });
});

async function importFreshHtmlTemplates() {
  (
    globalThis as { __WC_STORYBOOK_HELPERS_CONFIG__?: unknown }
  ).__WC_STORYBOOK_HELPERS_CONFIG__ = {
    categoryOrder: ["cssParts", "cssStates"],
  };
  vi.resetModules();
  const mod = await import("./html-templates.js");
  await new Promise((resolve) => setTimeout(resolve));
  return mod;
}

function renderedHtml(result: unknown): string {
  return (result as { values: string[] }).values?.[0] ?? (result as string);
}

describe("getStyleTemplate > CSS parts", () => {
  let getStyleTemplate: typeof import("./html-templates.js").getStyleTemplate;

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
