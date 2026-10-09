/* eslint-disable @typescript-eslint/no-explicit-any */
import { spread } from "./spread.js";
import { syncControls } from "../sync-controls.js";
import { html, unsafeStatic } from "lit/static-html.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type { TemplateResult } from "lit";
import type { Categories, StorybookHelpersOptions } from "../../types.js";
import type { Component } from "@wc-toolkit/cem-utilities";
import type { ArgTypes } from "storybook/internal/csf";
import {
  getAttributesAndProperties,
  getCssParts,
  getCssProperties,
  getCssStates,
  getSlots,
} from "../../cem-parser.js";
import { logEvent } from "../../storybook-helpers.js";
import { isCategoryEnabled } from "../categories.js";
import { transformToScoped } from "../styles.js";

let argObserver: MutationObserver | undefined;
let options: StorybookHelpersOptions = {};
let storyCounter = 0;
let observerTimer: ReturnType<typeof setTimeout> | undefined;

setTimeout(() => {
  options = (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
});

/**
 * Gets the template used to render the component in Storybook
 * @param component component object from the Custom Elements Manifest
 * @param args args object from Storybook story
 * @param slot content to be rendered between the component's opening and closing tags
 * @returns
 */
export function getTemplate(
  component?: Component,
  args?: any,
  slot?: TemplateResult,
  argTypes?: ArgTypes,
  excludeCategories?: Categories[],
  setComponentVariable?: boolean,
): TemplateResult {
  if (!args) {
    return html`<${unsafeStatic(component!.tagName!)}></${unsafeStatic(component!.tagName!)}>`;
  }

  const ops = getTemplateOperators(component!, args, argTypes);
  const { attrOperators, propOperators } = ops;
  const additionalAttrs = { ...(ops.additionalAttrs || {}) };

  let scopeSelector: string | undefined;
  if ((options as any)?.useScopedStyles && component?.tagName) {
    // generate a stable-ish id for this render to scope styles to this instance
    const storyId = `scope-${++storyCounter}`;
    additionalAttrs["data-story"] = storyId;
    scopeSelector = `${component.tagName}[data-story="${storyId}"]`;
  }

  const operators = { ...attrOperators, ...propOperators, ...additionalAttrs };
  const slotsTemplate = getSlotsTemplate(component!, args, excludeCategories);
  const styleTemplate = getStyleTemplate(
    component!,
    args,
    excludeCategories,
    scopeSelector,
  );
  clearTimeout(observerTimer);
  argObserver?.disconnect();
  if (!options.disableArgObserver) {
    const observe = syncControls(
      getAttributesAndProperties(component!).attrArgs,
      args,
    );
    observerTimer = setTimeout(() => {
      const element = document.querySelector<HTMLElement>(component!.tagName!);
      if (element) argObserver = observe(element);
    });
  }

  return html`${styleTemplate}
<${unsafeStatic(component!.tagName!)} ${spread(operators)}>${slotsTemplate}${slot || ""}</${unsafeStatic(component!.tagName!)}>
${
  options.setComponentVariable || setComponentVariable
    ? unsafeHTML(
        "<script>\n  window.component = document.querySelector('" +
          component!.tagName! +
          "');\n</script>",
      )
    : ""
}
`;
}

/**
 * Gets the template used to render the component's styles in Storybook
 * @param component component object from the Custom Elements Manifest
 * @param args args object from Storybook story
 * @returns styles in a tagged template literal
 */
export function getStyleTemplate(
  component?: Component,
  args?: any,
  excludeCategories?: Categories[],
  scopeSelector?: string,
) {
  const cssPropertiesTemplate = excludeCategory("cssProps", excludeCategories)
    ? ""
    : getCssPropTemplate(component!, args) || "";
  const cssPartsTemplate = excludeCategory("cssParts", excludeCategories)
    ? ""
    : getCssPartsTemplate(component!, args) || "";
  const cssStatesTemplate = excludeCategory("cssStates", excludeCategories)
    ? ""
    : getCssStatesTemplate(component!, args) || "";
  const template = [cssPropertiesTemplate, cssPartsTemplate, cssStatesTemplate]
    .filter((x) => x.length)
    .join("\n\n");

  const hasStyles =
    `${cssPropertiesTemplate}${cssPartsTemplate}${cssStatesTemplate}`.replace(
      /\s+/g,
      "",
    ) !== "";

  if (!hasStyles) return "";

  let styleContent = template;

  if ((options as any)?.useScopedStyles && component?.tagName) {
    const selector = scopeSelector || component.tagName;
    styleContent = transformToScoped(styleContent, selector);
  }

  return unsafeHTML(`<style>\n${styleContent}\n</style>`) as TemplateResult;
}

function excludeCategory(
  category: Categories,
  excludeCategories?: Categories[],
) {
  return (
    !options.categoryOrder ||
    !isCategoryEnabled(category, excludeCategories, options)
  );
}

/**
 * Gets a formatted object with the component's attributes and properties formatted to be used as operators in the template
 * @param component component object from the Custom Elements Manifest
 * @param args args object from Storybook story
 * @returns object of properties and attributes with their values
 */
function getTemplateOperators(
  component: Component,
  args: any,
  argTypes?: ArgTypes,
) {
  const { propArgs, attrArgs } = getAttributesAndProperties(component);
  const attrOperators: any = {};
  const propOperators: any = {};
  const additionalAttrs: any = {};

  Object.keys(attrArgs).forEach((key) => {
    const attr = attrArgs[key];
    const attrName = attr.name;
    const attrValue = args![key] as unknown;
    const prop =
      (attr.control as any).type === "boolean"
        ? `?${attrName}`
        : (attrName as string);
    if (
      attrValue !== attrArgs[key].defaultValue ||
      options.renderDefaultValues
    ) {
      attrOperators[prop] = attrValue === "false" ? false : attrValue;
    } else {
      attrOperators[prop] = undefined;
    }
  });

  Object.keys(args)
    .filter((key) => propArgs[key])
    .forEach((key) => {
      if (key.startsWith("on")) {
        return;
      }

      const propValue = args![key];
      propOperators[`.${key}`] = propValue;
    });

  Object.keys(args)
    .filter((x) => !Object.keys(argTypes || {}).includes(x))
    .forEach((key) => {
      // exclude Storybook event listeners
      if (!key.startsWith("on") && typeof args[key] !== "function") {
        additionalAttrs[key] = args[key];
      }
    });

  component.events?.forEach((event) => {
    if (!event.name) {
      return;
    }
    if (!additionalAttrs[`@${event.name}`]) {
      additionalAttrs[`@${event.name}`] = (e: Event) => logEvent(event.name, e);
    }
  });

  return { attrOperators, propOperators, additionalAttrs };
}

/**
 * Gets the template used to render the component's styles in Storybook
 * @param component component object from the Custom Elements Manifest
 * @param args args object from Storybook story
 * @returns string of css properties with arg values
 */
function getCssPropTemplate(component: Component, args: any) {
  if (!component?.cssProperties?.length) {
    return;
  }

  const { args: cssProperties } = getCssProperties(component);
  const values = Object.keys(cssProperties)
    .map((key) => {
      const isDefaultValue = args![key] === cssProperties[key].defaultValue;
      const cssName = cssProperties[key].name;
      const cssValue = args![key];
      return cssValue &&
        (!isDefaultValue || (isDefaultValue && options.renderDefaultValues))
        ? `    ${cssName}: ${cssValue}`
        : null;
    })
    .filter((value) => value !== null)
    .join(";\n");

  return values
    ? `  ${component.tagName} {
${values};
  }`
    : "";
}

/**
 * Gets the template used to render the component's CSS Shadow Parts in Storybook
 * @param component component object from the Custom Elements Manifest
 * @param args args object from Storybook story
 * @returns formatted string with CSS shadow parts and their styles
 */
function getCssPartsTemplate(component: Component, args: any) {
  if (!component?.cssParts?.length) {
    return;
  }

  const { args: cssParts } = getCssParts(component);

  return `${Object.keys(cssParts)
    .filter((key) => key.endsWith("-part"))
    .map((key) => {
      const cssPartName = cssParts[key].name;
      const cssPartValue: string = args![key];
      return cssPartValue && cssPartValue.replace(/\s+/g, "") !== ""
        ? `  ${component?.tagName}::part(${cssPartName}) {
${cssPartValue
  .split(`\n`)
  .map((part) => `    ${part}`)
  .join("\n")}
  }`
        : null;
    })
    .filter((value) => value !== null)
    .join("\n\n")}`;
}

/**
 * Gets the template used to render the component's CSS Shadow Parts in Storybook
 * @param component component object from the Custom Elements Manifest
 * @param args args object from Storybook story
 * @returns formatted string with CSS shadow parts and their styles
 */
function getCssStatesTemplate(component: Component, args: any) {
  if (!component?.cssStates?.length) {
    return;
  }

  const { args: cssStates } = getCssStates(component);

  return `${Object.keys(cssStates)
    .filter((key) => key.endsWith("-state"))
    .map((key) => {
      const cssStateName = cssStates[key].name;
      const cssStateValue: string = args![key];
      return cssStateValue && cssStateValue.replace(/\s+/g, "") !== ""
        ? `  ${component?.tagName}:state(${cssStateName}) {
${cssStateValue
  .split(`\n`)
  .map((state) => `    ${state}`)
  .join("\n")}
  }`
        : null;
    })
    .filter((value) => value !== null)
    .join("\n\n")}`;
}

/**
 * Gets the template used to render the component's slots in Storybook
 * @param component component object from the Custom Elements Manifest
 * @param args args object from Storybook story
 * @returns formatted string with slots and their values
 */
function getSlotsTemplate(
  component: Component,
  args: any,
  excludeCategories?: Categories[],
) {
  if (
    !component?.slots?.length ||
    excludeCategory("slots", excludeCategories)
  ) {
    return;
  }

  const { args: slots } = getSlots(component);

  const slotTemplates = `${Object.keys(slots)
    .filter((key) => key.endsWith("-slot"))
    .map((key) => {
      // trim the "-slot" scope from arg name
      const slotName = key === "default-slot" ? null : key.slice(0, -5);
      const slotValue = args![key];
      if (!slotName && slotValue) {
        return `  ${slotValue}`;
      }

      let slotContent = "";
      const container = document.createElement("div");
      if (slotValue !== undefined) {
        container.innerHTML = slotValue;
      }

      for (const child of container.childNodes) {
        if (child instanceof Text) {
          slotContent += `  <span slot=${slotName}>${child.textContent}</span>`;
        } else if (child instanceof Element) {
          child.setAttribute("slot", slotName!);
          slotContent += `  ${child.outerHTML}`;
        } else if (
          child.textContent?.trim() === "" ||
          child.textContent === "\n"
        ) {
          slotContent += child.textContent;
        }
      }

      return slotContent;
    })
    .filter((value) => value !== null && value !== "")
    .join("\n")}`;

  return slotTemplates.trim() ? unsafeStatic(`\n${slotTemplates}\n`) : "";
}
