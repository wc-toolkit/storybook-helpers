import { getStorybookHelpers } from "../../../src/index.js";
import "./my-element.js";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import type { MyElement } from "./my-element.js";

const { args, argTypes, template } = getStorybookHelpers("my-element", {
  excludeCategories: [
    // 'cssParts',
    // 'cssStates',
    // 'events',
    // 'methods',
    // 'properties',
    // 'slots',
    // 'cssProps', // <-- if removed the error goes away
  ],
  setComponentVariable: true,
});

console.log("args", argTypes);

const meta: Meta<MyElement> = {
  title: "My Element",
  component: "my-element",
  args,
  argTypes,
  render: (args) => template(args),
};
export default meta;

export const Default: StoryObj<MyElement & typeof args> = {
  args: {},
};
