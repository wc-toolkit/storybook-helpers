import { getStorybookHelpers } from "../../../src/index.js";
import { html } from "lit";
import "./my-element2.js";
import type { StoryObj } from "@storybook/web-components";
import type { MyElement2 } from "./my-element2.js";

const { args, events, argTypes, template } =
  getStorybookHelpers("my-element2");

const meta = {
  title: "My Element2",
  component: "my-element2",
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};
export default meta;

export const Default: StoryObj<MyElement2 & typeof args> = {
  render: (args) => html` ${template(args)} `,
  args: {},
};
