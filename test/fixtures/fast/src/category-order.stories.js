/** Exercises partial category ordering and exclusions through Autodocs. */
import {
  getStorybookHelpers,
  setStorybookHelpersConfig,
} from "@wc-toolkit/storybook-helpers/fast";
import "./fast-greeting.js";

const config = globalThis.__WC_STORYBOOK_HELPERS_CONFIG__;
// Capture a partial metadata order without changing other stories' rendering config.
setStorybookHelpersConfig({
  ...config,
  categoryOrder: ["slots", "properties"],
});
const { args, argTypes, render } = getStorybookHelpers("fast-greeting", {
  excludeCategories: ["cssStates"],
});
setStorybookHelpersConfig(config);

export default {
  title: "FAST/Category order",
  tags: ["autodocs"],
  args,
  argTypes,
  render,
  parameters: { controls: { sort: "none" } },
};

export const Default = {};
