/* eslint-disable @typescript-eslint/no-explicit-any */
import { TemplateResult } from "lit";
import { getStyleTemplate, getTemplate } from "./html-templates.js";
import {
  getCssParts,
  getCssProperties,
  getAttributesAndProperties,
  getReactEvents,
  getReactProperties,
  getSlots,
  getEvents,
  getCssStates,
  getMethods,
} from "./cem-parser.js";
import { Component, getComponentByTagName } from "@wc-toolkit/cem-utilities";
import type { ArgTypes } from '@storybook/web-components';
import type { Categories, Options, StoryHelpers, StoryOptions } from "./types";
import type { Package } from "custom-elements-manifest";

let userOptions: Options =
  (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
const defaultOptions: Options = {
  typeRef: "parsedType",
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
export function setStorybookHelpersConfig(options: Options) {
  options = { ...defaultOptions, ...options };
  (globalThis as any).__WC_STORYBOOK_HELPERS_CONFIG__ = options;
  userOptions = options;
}

/**
 * Gets Storybook helpers for a given component
 * @param tagName the tag name referenced in the Custom Elements Manifest
 * @returns An object containing the argTypes, reactArgTypes, events, styleTemplate, and template
 */
export function getStorybookHelpers<T>(
  tagName: string,
  options?: StoryOptions
): StoryHelpers<T> {
  userOptions = (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
  const cem = getManifest();
  const component = getComponent(cem, tagName);
  const eventNames = component?.events?.map((event) => event.name) || [];
  const argTypes = getArgTypes(component, options?.excludeCategories || []);

  const helpers = {
    args: getArgs<T>(argTypes),
    argTypes,
    reactArgs: getReactArgs(component),
    reactArgTypes: getReactProps(component),
    events: eventNames,
    styleTemplate: (args?: any) =>
      getStyleTemplate(component, args, options?.excludeCategories || []),
    template: (args?: any, slot?: TemplateResult) =>
      getTemplate(
        component,
        args,
        slot,
        argTypes,
        options?.excludeCategories || [],
        options?.setComponentVariable
      ),
  };

  return helpers;
}

function getManifest(): Package {
  /** Uses the global window.__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__ variable created by the Storybook `setCustomElementsManifest` method in the `preview` file */
  const cem: Package = (window as any).__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__;
  if (!cem) {
    throw new Error(
      `Custom Elements Manifest not found. Be sure to follow the pre-install steps in this guide:\nhttps://www.npmjs.com/package/wc-storybook-helpers#before-you-install`
    );
  }
  return cem;
}

function getComponent(cem: Package, tagName: string): Component | undefined {
  const component = getComponentByTagName(cem, tagName);

  if (!component) {
    throw new Error(
      `A component with the tag name "${tagName}" was not found in the Custom Elements Manifest. If it's missing in the CEM, it's often the result of a missing "@tag" or "@tagName" tag in the component's JSDoc.\nAdditional information can be found here:\nhttps://custom-elements-manifest.open-wc.org/analyzer/getting-started/#supported-jsdoc`
    );
  }

  return component;
}

/**
 * Gets the Storybook `argTypes` (controls) for the component
 * @param component component object from the Custom Elements Manifest
 * @returns an object containing the `argTypes` for the component
 */
function getArgTypes(
  component?: Component,
  excludeCategories?: Array<Categories>
): ArgTypes {
  const cssProps = getCssProperties(component);
  const cssParts = getCssParts(component);
  const slots = getSlots(component);
  const attrsAndProps = getAttributesAndProperties(component);
  const events = getEvents(component);
  const cssStates = getCssStates(component);
  const methods = getMethods(component);
  const args: Record<Categories, ArgTypes> = {
    attributes: attrsAndProps.attrArgs,
    cssParts: cssParts.args,
    cssProps: cssProps.args,
    cssStates: cssStates.args,
    events: events.args,
    methods: methods.args,
    properties: attrsAndProps.propArgs,
    slots: slots.args,
  };

  const argTypes: ArgTypes = {};

  // Combine all resets
  Object.assign(
    argTypes,
    cssProps.resets,
    cssParts.resets,
    slots.resets,
    attrsAndProps.resets,
    events.resets,
    cssStates.resets,
    methods.resets
  );

  userOptions.categoryOrder?.forEach((category) => {
    if (excludeCategories?.includes(category)) return;
    Object.assign(argTypes, args[category]);
  });

  return argTypes;
}

/**
 * Gets the Storybook `args` (default values) for the component
 * @param component component object from the Custom Elements Manifest
 * @param argTypes argTypes object for component
 * @returns an object containing the `args` for the component
 */
function getArgs<T>(argTypes: ArgTypes): Partial<T> & { [key: string]: any } {
  const args: Partial<T> & { [key: string]: any } = {};
  for (const [key, value] of Object.entries(argTypes)) {
    if (value?.control) {
      args[key as keyof T] = getDefaultValue(value.defaultValue) || "";
    }
  }
  return args;
}

/**
 * Gets the default value for a given attribute/property in the CEM
 * @param value the default value from the Custom Elements Manifest
 * @returns the default value
 */
function getDefaultValue(value?: string | number | boolean | object) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Gets the Storybook `argTypes` (controls) formatted for React components
 * @param component component object from the Custom Elements Manifest
 * @returns an object containing the `argTypes` for a React component
 */
function getReactProps(
  component?: Component,
  excludeCategories?: Array<Categories>
): ArgTypes {
  const cssProps = getCssProperties(component);
  const cssParts = getCssParts(component);
  const slots = getSlots(component);
  const attrsAndProps = getReactProperties(component);
  const events = getReactEvents(component);
  const cssStates = getCssStates(component);
  const methods = getMethods(component);
  const options: Options =
    (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};

  const args: Record<Exclude<Categories, "attributes">, ArgTypes> = {
    cssParts: cssParts.args,
    cssProps: cssProps.args,
    cssStates: cssStates.args,
    events: events.args,
    methods: methods.args,
    properties: attrsAndProps.args,
    slots: slots.args,
  };

  let argTypes: ArgTypes = {
    ...cssProps.resets,
    ...cssParts.resets,
    ...slots.resets,
    ...attrsAndProps.resets,
    ...events.resets,
    ...cssStates.resets,
    ...methods.resets,
  };

  (options.categoryOrder as Array<Exclude<Categories, "attributes">>)?.forEach(
    (category) => {
      if (excludeCategories?.includes(category)) return;
      argTypes = { ...argTypes, ...(args[category] || {}) };
    }
  );

  return argTypes;
}

/**
 * Gets the Storybook `args` (default values) formatted for React components
 * @param component component object from the Custom Elements Manifest
 * @returns an object containing the `args` for the component
 */
function getReactArgs(component?: Component): Record<string, any> {
  const args = getArgs(getReactProps(component));

  const events = Object.entries(getReactEvents(component))
    .map(([key]) => {
      return {
        [key]: () => {},
      };
    })
    .reduce((acc, value) => ({ ...acc, ...value }), {});

  return { ...args, ...events };
}
