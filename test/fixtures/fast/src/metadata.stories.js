import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers/fast";
import "./fast-greeting.js";

const { args, argTypes, render } = getStorybookHelpers("fast-greeting");

export default {
  title: "FAST/Metadata",
  args,
  argTypes,
  render,
};

export const Default = {};

export const Controls = {
  args: {
    label: "Controls",
    count: 0,
    disabled: true,
    data: { message: "Object binding" },
    "--padding": "0px",
    "label-part": "color: rgb(255, 0, 0);",
    "ready-state": "border-top: 3px solid;",
    "default-slot": "<strong>Default slot</strong>",
    "header-slot": "Named slot",
  },
};
