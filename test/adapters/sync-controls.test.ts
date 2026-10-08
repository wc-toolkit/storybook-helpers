// @vitest-environment happy-dom
import { expect, it, vi } from "vitest";
import { setArgObserver } from "../../src/adapters/sync-controls.js";
import { getAttributesAndProperties } from "../../src/cem-parser.js";
import { makeComponent } from "../helpers/make-component.js";

it("converts declared attributes, ignores unchanged values and disconnects", async () => {
  const component = makeComponent({
    fields: [
      { name: "label", type: { text: "string" } },
      { name: "count", type: { text: "number" } },
      { name: "disabled", type: { text: "boolean" } },
    ],
    attributes: ["label", "count", "disabled"].map((name) => ({
      name,
      fieldName: name,
    })),
  });
  const element = document.createElement("div");
  const updateArgs = vi.fn();
  const observer = setArgObserver(
    element,
    getAttributesAndProperties(component).attrArgs,
    updateArgs,
    { label: "Initial" },
  );
  try {
    element.setAttribute("label", "Initial");
    element.setAttribute("unknown", "Ignored");
    await new Promise((resolve) => setTimeout(resolve));
    expect(updateArgs).not.toHaveBeenCalled();

    element.setAttribute("label", "Changed");
    element.setAttribute("count", "0");
    element.setAttribute("disabled", "");
    await new Promise((resolve) => setTimeout(resolve));
    expect(updateArgs).toHaveBeenLastCalledWith({
      label: "Changed",
      count: 0,
      disabled: true,
    });

    observer.disconnect();
    updateArgs.mockClear();
    element.setAttribute("label", "Stale");
    await new Promise((resolve) => setTimeout(resolve));
    expect(updateArgs).not.toHaveBeenCalled();
  } finally {
    observer.disconnect();
  }
});
