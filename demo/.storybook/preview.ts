import type { Preview } from "@storybook/web-components-vite";
import { setCustomElementsManifest } from "@storybook/web-components-vite";
import customElements from "../custom-elements.json" with { type: "json" };
import { setStorybookHelpersConfig, scopedStylesDecorator } from "../../src/index.js";
import "./story-scopes.css";

setStorybookHelpersConfig({
  /** hides the `arg ref` label on each control */
  hideArgRef: false,
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef: "expandedType",
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable: false,
  /** renders default values for attributes and CSS properties */
  renderDefaultValues: false,
  categoryOrder: [
    "attributes",
    "slots",
    "cssParts",
    "cssProps",
    "cssStates",
    "properties",
    "events",
    "methods"
  ]
});

setCustomElementsManifest(customElements);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      // Exclude decorators from the rendered source snippet so wrapper classes
      // (used for scoping CSS) don't appear in the docs code block.
      source: { excludeDecorators: true },
    },
  },
  // Example: scope CSS variables per-story using the story name
  decorators: [scopedStylesDecorator('sb-story')],
};

export default preview;
