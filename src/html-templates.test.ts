import { describe, it, expect } from "vitest";
import { transformToScoped } from "./html-templates.js";

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
