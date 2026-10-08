/**
 * Checks the core adapter's published metadata types without renderer dependencies.
 */

import type { Meta } from "@storybook/html-vite";
import {
  getStorybookHelpers,
  setStorybookHelpersConfig,
  type StorybookHelpersOptions,
} from "@wc-toolkit/storybook-helpers/core";

interface Greeting extends HTMLElement {
  label: string;
}

const manifest: NonNullable<StorybookHelpersOptions["manifest"]> = {
  schemaVersion: "1.0.0",
  modules: [],
};

setStorybookHelpersConfig({ manifest });

const helpers = getStorybookHelpers<Greeting>("fast-greeting");
// @ts-expect-error Metadata-only helpers have no rendering API.
helpers.template;

export const meta = {
  args: helpers.args,
  argTypes: helpers.argTypes,
  render: (args) => {
    const element = document.createElement("fast-greeting");
    element.setAttribute("label", args.label);
    return element;
  },
} satisfies Meta<Greeting>;
