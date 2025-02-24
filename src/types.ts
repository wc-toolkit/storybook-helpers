export {}

declare global {
  interface Global {
    __WC_STORYBOOK_HELPERS_CONFIG__?: Options;
  }
  let globalThis: Global;
}

export interface Options {
  /** hides the `arg ref` label on each control */
  hideArgRef?: boolean;
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef?: string;
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable?: boolean;
  /** renders default values for attributes and CSS properties */
  renderDefaultValues?: boolean;
}
