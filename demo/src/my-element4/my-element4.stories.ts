import { getStorybookHelpers } from "../../../src/index.js";
import "./my-element4.js";
import type { StoryObj } from "@storybook/web-components-vite";
import type { MyElement4 } from "./my-element4.js";

let { args, events, argTypes, template } = getStorybookHelpers("my-element4");

const meta = {
  title: "My Element4",
  component: "my-element4",
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};
export default meta;

export const Default: StoryObj<MyElement4 & typeof args> = {
  render: (args) => template(args),
};

export const WithArgs: StoryObj<MyElement4 & typeof args> = {
  render: (args) => template(args),
  args: {
    objectNoAttribute: {someValue: 'Value set from Story args'},
    functionNoAttribute: j => j * 5
  }
};