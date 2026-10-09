/**
 * Checks the Lit adapter's published types without a web-components renderer.
 */

import type { Meta } from "@storybook/html-vite";
import type { TemplateResult } from "lit";
import {
  getStorybookHelpers,
  setStorybookHelpersConfig,
  type StoryHelpers,
} from "@wc-toolkit/storybook-helpers";

setStorybookHelpersConfig({ renderDefaultValues: true });

const helpers: StoryHelpers<HTMLElement> =
  getStorybookHelpers<HTMLElement>("fast-greeting");

const meta: Meta<HTMLElement> = {
  args: helpers.args,
  argTypes: helpers.argTypes,
  render: () => document.createElement("div"),
};

const template: TemplateResult = helpers.template();
const styles: TemplateResult | "" = helpers.styleTemplate();

export { meta, template, styles };
