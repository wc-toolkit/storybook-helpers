import { getStorybookHelpers } from "../../../src/index.js";
import { html } from "lit";
import "./my-element";
import type { Meta, StoryObj } from "@storybook/web-components";
import type { MyElement } from "./my-element";

const { args, events, argTypes, template } =
  getStorybookHelpers("my-element");

console.log(args, events, argTypes, template);

const meta: Meta<MyElement> = {
  title: "My Element",
  component: "my-element",
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
};
export default meta;

export const Default: StoryObj<MyElement & typeof args> = {
  render: (args) => html` ${template(args)} `,
  args: {},
};
