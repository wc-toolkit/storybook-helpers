/** Exercises partial category ordering and exclusions through Autodocs. */
import {
  getStorybookHelpers,
  setStorybookHelpersConfig,
} from "@wc-toolkit/storybook-helpers";
import "./lit-greeting.js";

const config = globalThis.__WC_STORYBOOK_HELPERS_CONFIG__;
// Capture a partial metadata order without changing other stories' rendering config.
setStorybookHelpersConfig({
  ...config,
  categoryOrder: ["slots", "properties"],
});
const { args, argTypes, template } = getStorybookHelpers("lit-greeting", {
  excludeCategories: ["cssStates"],
});
setStorybookHelpersConfig(config);

export default {
  title: "Lit/Category order",
  tags: ["autodocs"],
  args,
  argTypes,
  render: (args) => template(args),
  parameters: { controls: { sort: "none" } },
};

export const Default = {};
