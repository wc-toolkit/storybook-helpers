import { getHelperData } from "../../storybook-helpers.js";
import type { StoryOptions, TemplateAdapters } from "../../types.js";
import type { ViewTemplate } from "@microsoft/fast-element";
import type { Args } from "./templates.js";
import { getHtmlTemplates } from "./templates.js";
import { getRender } from "./story.js";

export { setStorybookHelpersConfig } from "../../config.js";
export type * from "../../types.js";

export type StoryHelpers<T> = ReturnType<typeof getHelperData<T>>["helpers"] &
  TemplateAdapters<Args<T>, ViewTemplate> & {
    render: ReturnType<typeof getRender<T>>;
  };

/** Generates FAST templates and an HTML/Vite renderer from component metadata. */
export function getStorybookHelpers<T = HTMLElement>(
  tagName: string,
  options?: StoryOptions,
): StoryHelpers<T> {
  const data = getHelperData<T>(tagName, options);
  const templates = getHtmlTemplates<T>(data, options);

  return {
    ...data.helpers,
    template: templates.getTemplate,
    styleTemplate: templates.getStyleTemplate,
    render: getRender<T>(tagName, templates, options),
  };
}
