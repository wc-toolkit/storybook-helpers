// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import type { Package } from "custom-elements-manifest";
import {
  ExecutionContext,
  HTMLBindingDirective,
  ViewTemplate,
} from "@microsoft/fast-element";
import { getHtmlTemplates } from "../../../src/adapters/fast/templates.js";
import { getHelperData } from "../../../src/storybook-helpers.js";
import { makeComponent } from "../../helpers/make-component.js";

afterEach(() => {
  delete globalThis.__WC_STORYBOOK_HELPERS_CONFIG__;
});

function templates(component: ReturnType<typeof makeComponent>) {
  const manifest: Package = {
    schemaVersion: "1.0.0",
    modules: [
      {
        kind: "javascript-module",
        path: "test.js",
        declarations: [
          {
            ...component,
            kind: "class",
            name: "TestElement",
            customElement: true,
          },
        ],
      },
    ],
  };
  return getHtmlTemplates(getHelperData("test-element", { manifest }));
}

/** Reads the CSS expression without compiling or mounting a view. */
function styleText(result: ViewTemplate | "") {
  if (!result) return "";
  const binding = Object.values(result.factories).find(
    (factory) => factory instanceof HTMLBindingDirective,
  );
  if (!(binding instanceof HTMLBindingDirective))
    throw new Error("Missing CSS binding");
  return String(binding.dataBinding.evaluate({}, ExecutionContext.default));
}

for (const [category, component, key, selector] of [
  [
    "CSS parts",
    makeComponent({ cssParts: [{ name: "foo" }] }),
    "foo-part",
    "::part(foo)",
  ],
  [
    "CSS states",
    makeComponent({ cssStates: [{ name: "open" }] }),
    "open-state",
    ":state(open)",
  ],
] as const) {
  describe(`getStyleTemplate > ${category}`, () => {
    it("does not throw when a declared rule has no corresponding arg", () => {
      expect(() => templates(component).getStyleTemplate({})).not.toThrow();
    });

    it("omits the rule when its arg is absent", () => {
      expect(
        styleText(templates(component).getStyleTemplate({})),
      ).not.toContain(selector);
    });

    it("emits the rule when its arg is set", () => {
      const result = templates(component).getStyleTemplate({
        [key]: "color: red",
      });
      expect(result).toBeInstanceOf(ViewTemplate);
      const css = styleText(result);
      expect(css).toContain(`test-element${selector}`);
      expect(css).toContain("color: red");
    });
  });
}

it("scopes host, part and state rules to the supplied instance", () => {
  globalThis.__WC_STORYBOOK_HELPERS_CONFIG__ = { useScopedStyles: true };
  const { getStyleTemplate } = templates(
    makeComponent({
      cssProperties: [{ name: "--padding" }],
      cssParts: [{ name: "foo" }],
      cssStates: [{ name: "open" }],
    }),
  );
  const css = styleText(
    getStyleTemplate(
      {
        "--padding": "0px",
        "foo-part": "color: red",
        "open-state": "display: block",
      },
      'test-element[data-story="one"]',
    ),
  );

  expect(css).toContain('@scope (test-element[data-story="one"])');
  expect(css).toContain(":scope { --padding: 0px;");
  expect(css).toContain(":scope::part(foo)");
  expect(css).toContain(":scope:state(open)");
});
