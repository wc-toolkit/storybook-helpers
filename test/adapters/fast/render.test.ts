// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { html } from "@microsoft/fast-element";
import { render } from "../../../src/adapters/fast/templates.js";

describe("FAST > render", () => {
  it("renders supplied args and returns a single element without a host", () => {
    const template = html<{ label: string }>`<span
      >${(args) => args.label}</span
    >`;
    const renderStory = render(template);
    const element = renderStory({ label: "Hello FAST" });

    expect(element).toBeInstanceOf(Element);
    expect(element.textContent).toBe("Hello FAST");
    expect(element.parentNode).toBeInstanceOf(DocumentFragment);
    expect(customElements.get("wc-toolkit-fast-story")).toBeUndefined();

    expect(renderStory({ label: "Updated FAST" }).textContent).toBe(
      "Updated FAST",
    );
  });

  it("returns a fragment containing all sibling elements", () => {
    const result = render(
      html`<style>
          span {
            color: red;
          }</style
        ><span>Hello</span>`,
    )({});

    expect(result).toBeInstanceOf(DocumentFragment);
    expect(result.childElementCount).toBe(2);
    expect(result.firstElementChild?.tagName).toBe("STYLE");
    expect(result.lastElementChild?.textContent).toBe("Hello");
  });

  it("returns a fragment when the template has no elements", () => {
    const result = render(html`${() => "Text only"}`)({});

    expect(result).toBeInstanceOf(DocumentFragment);
    expect(result.childElementCount).toBe(0);
    expect(result.textContent).toBe("Text only");
  });
});
