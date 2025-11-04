/* eslint-disable @typescript-eslint/no-explicit-any */
import { spread } from "./spread.js";
import { useArgs } from "storybook/preview-api";
import { html, unsafeStatic } from "lit/static-html.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type { TemplateResult } from "lit";
import type { Categories, Options } from "./types.js";
import type { Component } from "@wc-toolkit/cem-utilities";
import type { ArgTypes } from "@storybook/web-components";
import {
  getAttributesAndProperties,
  getCssParts,
  getCssProperties,
  getCssStates,
  getSlots,
} from "./cem-parser.js";

let argObserver: MutationObserver | undefined;
let lastTagName: string | undefined;
let options: Options = {};

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
  containerSelector?: string,
): TemplateResult {
  if (!args) {
    return html`<${unsafeStatic(component!.tagName!)}></${unsafeStatic(component!.tagName!)}>`;
  }

  // reset argObserver if the component changes
  if (component?.tagName !== lastTagName) {
    argObserver = undefined;
    lastTagName = component?.tagName;
  }

  const { attrOperators, propOperators, additionalAttrs } =
    getTemplateOperators(component!, args, argTypes);
  const operators = { ...attrOperators, ...propOperators, ...additionalAttrs };
  const slotsTemplate = getSlotsTemplate(component!, args, excludeCategories);
  syncControls(component!, containerSelector);

  return html`${getStyleTemplate(component, args, excludeCategories)}
<${unsafeStatic(component!.tagName!)} ${spread(operators)}>${slotsTemplate}${slot || ""}</${unsafeStatic(component!.tagName!)}>
${options.setComponentVariable || setComponentVariable
      ? unsafeHTML(`
      <script>
        let containerElement = ${containerSelector ? `document.querySelector('${containerSelector}')` : 'document'}
        containerElement ??= document;
        if (containerElement instanceof HTMLTemplateElement) {
          containerElement = containerElement.content;
        }
        if (containerElement.shadowRoot) {
          containerElement = containerElement.shadowRoot;
        } 
        window.component = containerElement.querySelector('" +component!.tagName! +"');
      </script>
    `.trim())
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

  return `${cssPropertiesTemplate}${cssPartsTemplate}${cssStatesTemplate}`.replace(
    /\s+/g,
    "",
  ) !== ""
    ? (unsafeHTML(`<style>\n${template}\n</style>`) as TemplateResult)
    : "";
}

function excludeCategory(
  category: Categories,
  excludeCategories?: Categories[],
) {
  return (
    !options.categoryOrder?.includes(category) ||
    excludeCategories?.includes(category as Categories) ||
    false
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
      return cssPartValue.replace(/\s+/g, "") !== ""
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
      return cssStateValue.replace(/\s+/g, "") !== ""
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
      container.innerHTML = slotValue;

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

function getContainerElement(containerSelector?: string): DocumentFragment | ShadowRoot | Document {
  let containerElement: DocumentFragment | ShadowRoot | Document = containerSelector
    ? document.querySelector(containerSelector)!
    : document;

  if (containerElement instanceof HTMLTemplateElement) {
    return containerElement.content;
  }

  if ("shadowRoot" in containerElement) {
    return containerElement.shadowRoot!;
  }

  return containerElement
}

/**
 * Watches for changes to the component's attributes and properties and updates Storybook controls
 * @param component component object from the Custom Elements Manifest
 */
function syncControls(component: Component, containerSelector?: string) {
  setArgObserver(component);

  // wait for story to render before trying to attach the observer
  setTimeout(() => {
    const containerElement = getContainerElement(containerSelector);
    const selectedComponent = containerElement.querySelector(component.tagName!)!;
    argObserver?.observe(selectedComponent, {
      attributes: true,
    });
  });
}

/**
 * Sets up the MutationObserver to sync the component's attributes and properties with Storybook controls
 * @param component component object from the Custom Elements Manifest
 */
function setArgObserver(component: Component) {
  let isUpdating = false;
  const updateArgs = useArgs()[1];
  const { attrArgs: attributes } = getAttributesAndProperties(component);

  if (argObserver) {
    return;
  }

  argObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class" && isUpdating) {
        return;
      }

      isUpdating = true;
      const attribute = attributes[`${mutation.attributeName}`];
      if (
        attribute?.control === "boolean" ||
        (attribute?.control as any)?.type === "boolean"
      ) {
        updateArgs({
          [`${mutation.attributeName}`]: (
            mutation.target as HTMLElement
          )?.hasAttribute(mutation.attributeName || ""),
        });
      } else {
        updateArgs({
          [`${mutation.attributeName}`]: (
            mutation.target as HTMLElement
          ).getAttribute(mutation.attributeName || ""),
        });
      }

      isUpdating = false;
    });
  });
}
