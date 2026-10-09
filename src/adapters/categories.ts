import type { Categories, StorybookHelpersOptions } from "../types.js";

/** An explicit exclusion wins; an omitted category order enables all categories. */
export function isCategoryEnabled(
  category: Categories,
  excluded: Categories[] = [],
  config: StorybookHelpersOptions = globalThis.__WC_STORYBOOK_HELPERS_CONFIG__ ||
    {},
) {
  return (
    !excluded.includes(category) &&
    (!config.categoryOrder || config.categoryOrder.includes(category))
  );
}
