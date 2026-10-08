import type { StorybookHelpersOptions } from "./types.js";
export const defaultOptions: StorybookHelpersOptions = {
  typeRef: "parsedType",
  useScopedStyles: false,
  categoryOrder: [
    "attributes",
    "properties",
    "slots",
    "cssProps",
    "cssParts",
    "cssStates",
    "methods",
    "events",
  ],
};

/**
 * sets the global config for the Storybook helpers
 * @param options
 */
export function setStorybookHelpersConfig(
  options: StorybookHelpersOptions = {},
) {
  options = { ...defaultOptions, ...options };
  globalThis.__WC_STORYBOOK_HELPERS_CONFIG__ = options;
}

declare global {
  // eslint-disable-next-line no-var
  var __WC_STORYBOOK_HELPERS_CONFIG__: StorybookHelpersOptions | undefined;
}
