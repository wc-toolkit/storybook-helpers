import { TemplateResult } from "lit";
import { ArgTypes } from "./storybook-types";

export type Categories =
  | "attributes"
  | "cssParts"
  | "cssProps"
  | "cssStates"
  | "events"
  | "methods"
  | "properties"
  | "slots";

export type Options = {
  /** hides the `arg ref` label on each control */
  hideArgRef?: boolean;
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef?: string;
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable?: boolean;
  /** renders default values for attributes and CSS properties */
  renderDefaultValues?: boolean;
  /** Category order */
  categoryOrder?: Array<Categories>;
};

export type StoryOptions = {
  /** Categories to exclude from these stories */
  excludeCategories?: Array<Categories>;
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable?: boolean;
};

export type StoryHelpers<T> = {
  args: Partial<T>;
  argTypes: ArgTypes;
  reactArgs: Record<string, unknown>;
  reactArgTypes: ArgTypes;
  events: string[];
  styleTemplate: (args?: Record<string, unknown>) => TemplateResult | "";
  template: (args?: Partial<T>, slot?: TemplateResult) => TemplateResult;
};
