/**
 * Checks the FAST adapter's published template and HTML/Vite renderer types.
 */
import type { Meta } from "@storybook/html-vite";
import type { ViewTemplate } from "@microsoft/fast-element";
import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers/fast";

interface Greeting extends HTMLElement {
  label: string;
}

const helpers = getStorybookHelpers<Greeting>("fast-greeting");
const template: ViewTemplate = helpers.template({ label: "Hello" });
const styles: ViewTemplate | "" = helpers.styleTemplate();

export const meta = {
  args: helpers.args,
  argTypes: helpers.argTypes,
  render: helpers.render,
} satisfies Meta<Greeting>;

export { template, styles };
