/* eslint-disable @typescript-eslint/no-explicit-any */
import { TemplateResult } from "lit";
import type { ArgTypes } from "@storybook/web-components";

export type Categories =
  | "attributes"
  | "cssParts"
  | "cssProps"
  | "cssStates"
  | "events"
  | "methods"
  | "properties"
  | "slots";

export type StorybookHelpersOptions = {
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

/** @deprecated Use StorybookHelpersOptions instead */
export type Options = StorybookHelpersOptions;

export type StoryOptions = {
  /** Categories to exclude from these stories */
  excludeCategories?: Array<Categories>;
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable?: boolean;
};

export type StoryHelpers<T> = {
  /** Default args for the component stories */
  args: Partial<T> & { [key: string]: any };
  /** ArgTypes configuration for Storybook controls */
  argTypes: ArgTypes;
  /** React-compatible args for React wrapper components */
  reactArgs: Record<string, unknown>;
  /** React-compatible argTypes for Storybook controls in React */
  reactArgTypes: ArgTypes;
  /** Function to log events emitted by the component in the "Actions" panel */
  logEvent: (eventName: string, event: Event) => void;
  /** Template function for rendering component styles */
  styleTemplate: (args?: Record<string, unknown>) => TemplateResult | "";
  /** Template function for rendering the component with args and optional slot content */
  template: (
    args?: Partial<T> & { [key: string]: any },
    slot?: TemplateResult,
  ) => TemplateResult;
  /** 
   * List of custom events emitted by the component
   * @deprecated adding events to the story's meta is no longer supported in v10. If you are using the `template` function to render your component, the events will be automatically bound. Otherwise, you can manually map them using the `logEvent` function.
   */
  events: string[];
};
