/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TemplateResult } from "lit";
import { getStyleTemplate, getTemplate } from "./templates.js";
import { getHelperData } from "../../storybook-helpers.js";
import type { StoryOptions, TemplateAdapters } from "../../types.js";

export type StoryHelpers<T> = ReturnType<typeof getHelperData<T>>["helpers"] &
  TemplateAdapters<
    Partial<T> & { [key: string]: any },
    TemplateResult,
    Record<string, unknown>
  >;

export { setStorybookHelpersConfig } from "../../config.js";

/** Combines shared component metadata with Lit-native story templates. */
export function getStorybookHelpers<T>(
  tagName: string,
  options?: StoryOptions,
): StoryHelpers<T> {
  const { component, helpers } = getHelperData<T>(tagName, options);
  return {
    ...helpers,
    styleTemplate: (args?: any) =>
      getStyleTemplate(component, args, options?.excludeCategories || []),
    template: (args?: any, slot?: TemplateResult) =>
      getTemplate(
        component,
        args,
        slot,
        helpers.argTypes,
        options?.excludeCategories || [],
        options?.setComponentVariable,
      ),
  };
}
