import type { Package } from "custom-elements-manifest";

/** Common template contract; adapters retain their native template and render types. */
export type TemplateAdapters<TArgs, TTemplate, TStyleArgs = TArgs> = {
  template: (args?: TArgs, slot?: TTemplate) => TTemplate;
  styleTemplate: (args?: TStyleArgs) => TTemplate | "";
};

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
  /** Explicit manifest for integrations without the web-components renderer. */
  manifest?: Package;
  /** hides the `arg ref` label on each control */
  hideArgRef?: boolean;
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef?: string;
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable?: boolean;
  /** renders default values for attributes and CSS properties */
  renderDefaultValues?: boolean;
  /** Wrap generated CSS in a CSS `@scope` rule */
  useScopedStyles?: boolean;
  /** Category order */
  categoryOrder?: Array<Categories>;
  /** Disables the MutationObserver that syncs component attributes and properties with Storybook controls */
  disableArgObserver?: boolean;
  /** When true, infers CSS custom property controls from their declared CEM type instead of the property name */
  useCssPropTypes?: boolean;
};

/** @deprecated Use StorybookHelpersOptions instead */
export type Options = StorybookHelpersOptions;

export type StoryOptions = {
  /** Overrides the configured manifest for this component. */
  manifest?: Package;
  /** Categories to exclude from these stories */
  excludeCategories?: Array<Categories>;
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable?: boolean;
};
