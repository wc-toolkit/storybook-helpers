import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers";
import "./lit-greeting.js";

const { args, argTypes, template } = getStorybookHelpers("lit-greeting");

export default {
  title: "Lit/Metadata",
  args,
  argTypes,
  render: (args) => template(args),
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
