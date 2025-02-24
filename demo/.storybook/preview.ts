import type { Preview } from "@storybook/web-components";
import { setCustomElementsManifest } from "@storybook/web-components";
import customElements from "../custom-elements.json" with { type: "json" };
import { setWcStorybookHelpersConfig } from "../../src/index.js";

setWcStorybookHelpersConfig({
  /** hides the `arg ref` label on each control */
  hideArgRef: false,
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef: "expandedType",
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable: false,
  /** renders default values for attributes and CSS properties */
  renderDefaultValues: false,
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
  },
};

export default preview;
