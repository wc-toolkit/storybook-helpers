import { describe, expect, it } from "vitest";
import { transformToScoped } from "../../src/adapters/styles.js";

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

  it("handles full instance selectors without rewriting declaration values", () => {
    const selector = 'my-element[data-story="one"]';
    const out = transformToScoped(
      `${selector} { --label: "my-element"; }\n${selector}::part(foo) { color: red; }`,
      selector,
    );
    expect(out).toContain(`@scope (${selector})`);
    expect(out).toContain(':scope { --label: "my-element"; }');
    expect(out).toContain(":scope::part(foo)");
    expect(out).not.toContain(':scope[data-story="one"]');
  });
});
