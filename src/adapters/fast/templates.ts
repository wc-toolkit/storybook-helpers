import {
  html,
  ViewTemplate,
  HTMLDirective,
  HTMLBindingDirective,
  oneWay,
  listener,
  repeat,
} from "@microsoft/fast-element";
import type { AddViewBehaviorFactory, Binding } from "@microsoft/fast-element";
import type { getHelperData } from "../../storybook-helpers.js";
import { FastStory } from "./story.js";
import {
  getAttributesAndProperties,
  getCssParts,
  getCssProperties,
  getCssStates,
  getSlots,
} from "../../cem-parser.js";
import type { Categories, StoryOptions } from "../../types.js";
import { isCategoryEnabled } from "../categories.js";
import { transformToScoped } from "../styles.js";

export type Args<T> = Partial<T> & Record<string, unknown>;
type BindingSource = Record<string, unknown> | FastStory;
type StoryBinding = { name: string; binding: Binding };

let instance = 0;

/**
 * Supplies manifest-derived binding names that cannot be written statically in html.
 * FAST's native directives own the actual DOM updates and observation.
 */
class StoryBindings implements HTMLDirective {
  constructor(private values: StoryBinding[]) {}

  createHTML(add: AddViewBehaviorFactory) {
    return this.values
      .map(({ name, binding }) => {
        if (!/^[?:@]?[a-zA-Z_$][\w$:.-]*$/.test(name)) {
          throw new Error(`Invalid template binding "${name}".`);
        }

        const directive = new HTMLBindingDirective(binding);
        HTMLDirective.assignAspect(directive, name);

        return `${name}="${directive.createHTML(add)}"`;
      })
      .join(" ");
  }
}

HTMLDirective.define(StoryBindings);

/**
 * Creates the generated FAST templates from renderer-neutral helper data.
 */
export function getHtmlTemplates<T>(
  { component, helpers }: ReturnType<typeof getHelperData<T>>,
  options?: StoryOptions,
) {
  const tagName = component.tagName!;

  if (!/^[a-z][a-z0-9._-]*-[a-z0-9._-]*$/.test(tagName)) {
    throw new Error(`Invalid custom element tag name "${tagName}".`);
  }

  const { attrArgs, propArgs } = getAttributesAndProperties(component);

  const config = () => globalThis.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
  const enabled = (category: Categories) =>
    isCategoryEnabled(category, options?.excludeCategories, config());

  /**
   * Generates external consumer CSS, not the component's shadow-root styles.
   */
  function styles(args: Args<T>, selector: string) {
    const declarations = enabled("cssProps")
      ? Object.entries(getCssProperties(component).args || {})
          .filter(
            ([key, arg]) =>
              args[key] != null &&
              args[key] !== "" &&
              (config().renderDefaultValues || args[key] !== arg.defaultValue),
          )
          .map(([key, arg]) => `${arg.name}: ${String(args[key])};`)
          .join("\n")
      : "";

    const rules = declarations ? [`${selector} { ${declarations} }`] : [];

    for (const [category, suffix, pseudo, data] of [
      ["cssParts", "-part", "::part", getCssParts(component).args],
      ["cssStates", "-state", ":state", getCssStates(component).args],
    ] as const) {
      if (!enabled(category)) continue;

      for (const [key, arg] of Object.entries(data || {})) {
        if (key.endsWith(suffix) && args[key]) {
          rules.push(
            `${selector}${pseudo}(${arg.name}) { ${String(args[key])} }`,
          );
        }
      }
    }

    const css = rules.join("\n");

    return config().useScopedStyles && css
      ? transformToScoped(css, selector)
      : css;
  }

  /** Wraps CSS controls in a FAST template that composes into the story. */
  function getStyleTemplate(args: Args<T> = {}, selector = tagName) {
    const css = styles(args, selector);

    return css
      ? html`<style>
          ${() => css}
        </style>`
      : "";
  }

  /**
   * Maps manifest entries to FAST attribute, property and event bindings.
   * Sources can be standalone args or the FastStory host containing those args.
   */
  function getTemplateOperators(args: Args<T>, scope: string) {
    const sourceArgs = (source: BindingSource) =>
      source instanceof FastStory ? source.args : source;

    const attributes = Object.entries(enabled("attributes") ? attrArgs : {})
      .filter(
        ([key, arg]) =>
          config().renderDefaultValues || args[key] !== arg.defaultValue,
      )
      .map<StoryBinding>(([key, arg]) => {
        const boolean =
          typeof arg.type === "object" && arg.type.name === "boolean";

        return {
          name: `${boolean ? "?" : ""}${arg.name}`,
          binding: oneWay((source: BindingSource) => {
            const value = sourceArgs(source)[key];

            return boolean ? value !== "false" && Boolean(value) : value;
          }),
        };
      });

    const properties = Object.keys(args)
      .filter(
        (key) =>
          !key.startsWith("on") &&
          ((propArgs[key] && enabled("properties")) ||
            (!helpers.argTypes[key] && typeof args[key] !== "function")),
      )
      .map<StoryBinding>((key) => ({
        name: propArgs[key] && enabled("properties") ? `:${key}` : key,
        binding: oneWay((source: BindingSource) => sourceArgs(source)[key]),
      }));

    const events = (
      enabled("events") ? component.events || [] : []
    ).map<StoryBinding>((event) => ({
      name: `@${event.name}`,
      binding: listener((_source, context) => {
        helpers.logEvent(event.name, context.event);

        return true;
      }),
    }));

    const scoping: StoryBinding[] = scope
      ? [{ name: "data-story", binding: oneWay(() => scope) }]
      : [];

    return new StoryBindings([
      ...scoping,
      ...attributes,
      ...properties,
      ...events,
    ]);
  }

  /**
   * Composes trusted slot-control HTML. Named content uses a slotted span wrapper.
   */
  function getSlotsTemplate(args: Args<T>) {
    const templates = enabled("slots")
      ? Object.entries(getSlots(component).args || {})
          .filter(([key]) => key.endsWith("-slot") && args[key])
          .map(([key, arg]) => {
            const content = html.partial(String(args[key]));

            return key === "default-slot"
              ? html`${content}`
              : html`<span slot="${() => arg.name}">${content}</span>`;
          })
      : [];

    return html`${repeat(
      templates,
      html`${(template: ViewTemplate) => template}`,
    )}`;
  }

  /**
   * Builds the outer story template; the registered component owns its internals.
   * Standalone templates do not synchronize changes back to Storybook Controls.
   */
  function getTemplate(args: Args<T> = {}, slot?: ViewTemplate) {
    const scope = config().useScopedStyles ? `fast-story-${++instance}` : "";
    const selector = scope ? `${tagName}[data-story="${scope}"]` : tagName;

    // Only the validated tag name is dynamic markup; args are applied by the directive.
    return html<Args<T>>`
      ${getStyleTemplate(args, selector)} ${html.partial(`<${tagName}`)}
      ${getTemplateOperators(args, scope)}>
      ${getSlotsTemplate(args)}${slot || ""} ${html.partial(`</${tagName}>`)}
    `;
  }

  return { getTemplate, getStyleTemplate, attrArgs, propArgs, enabled, config };
}
