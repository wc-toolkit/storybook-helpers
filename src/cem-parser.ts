/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getComponentEventsWithType,
  getComponentPublicMethods,
  getMemberDescription,
  removeQuotes,
} from "@wc-toolkit/cem-utilities";
import type { ArgTypes } from "@storybook/web-components";
import type { StorybookHelpersOptions } from "./types.js";
import type { Component } from "@wc-toolkit/cem-utilities";
import { CssCustomProperty } from "custom-elements-manifest";

type ArgSet = {
  resets?: ArgTypes;
  args: ArgTypes;
};

type StorybookControl = ArgTypes[string]["control"];

let helpersOptions: StorybookHelpersOptions = {};

setTimeout(() => {
  helpersOptions = (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
});

export function getAttributesAndProperties(
  component?: Component,
  enabled = true,
): {
  resets?: ArgTypes;
  propArgs: ArgTypes;
  attrArgs: ArgTypes;
} {
  const resets: ArgTypes = {};
  const attrArgs: ArgTypes = {};
  const propArgs: ArgTypes = {};

  component?.members?.forEach((member) => {
    if (member.kind !== "field") {
      return;
    }

    const attribute = component.attributes?.find(
      (x) => member.name === x.fieldName,
    );
    const propName = member.name;
    const args = attribute ? attrArgs : propArgs;

    resets[propName] = {
      name: propName,
      table: {
        disable: true,
      },
    };

    if (
      member.privacy === "private" ||
      member.privacy === "protected" ||
      member.static
    ) {
      return;
    }

    const name = attribute?.name || member.name;
    const type = helpersOptions.typeRef
      ? (member as any)[`${helpersOptions.typeRef}`]?.text || member?.type?.text
      : member?.type?.text;
    const propType = cleanUpType(type);
    const {
      control,
      options,
      type: sbType,
    } = getControl(propType, attribute !== undefined);
    const defaultValue =
      member.readonly || sbType?.name === "other"
        ? undefined
        : getDefaultValue(control, member.default);

    args[name] = {
      name: name,
      description: getDescription(
        (member as any).summary || member.description,
        propName,
        member.deprecated as string,
      ),
      defaultValue,
      control: enabled && !member.readonly && control ? control : false,
      options,
      table: {
        category: attribute ? "attributes" : "properties",
        defaultValue: {
          summary: defaultValue && JSON.stringify(defaultValue),
        },
        type: {
          summary: type,
        },
      },
      type: sbType,
    };

    if (attribute?.name && attribute.name !== member.name) {
      propArgs[member.name] = {
        name: member.name,
        description: getDescription(
          (member as any).summary || member.description,
          member.name,
          member.deprecated as string,
        ),
        defaultValue,
        control: enabled && !member.readonly && control ? control : false,
        options,
        table: {
          category: "properties",
          defaultValue: {
            summary: JSON.stringify(defaultValue),
          },
          type: {
            summary: type,
          },
        },
        type: sbType,
      };
    }
  });

  return { resets, propArgs, attrArgs };
}

export function getReactProperties(
  component?: Component,
  enabled = true,
): ArgSet {
  const resets: ArgTypes = {};
  const args: ArgTypes = {};

  component?.members?.forEach((member) => {
    if (member.kind !== "field") {
      return;
    }

    resets[member.name] = {
      name: member.name,
      table: {
        disable: true,
      },
    };

    if (
      member.privacy === "private" ||
      member.privacy === "protected" ||
      member.static
    ) {
      return;
    }

    const type = helpersOptions.typeRef
      ? (member as any)[`${helpersOptions.typeRef}`]?.text || member?.type?.text
      : member?.type?.text;
    const propType = cleanUpType(type);
    const propName = `${member.name}`;
    const { control, options, type: sbType } = getControl(propType);
    const defaultValue = member.readonly
      ? undefined
      : getDefaultValue(control, member.default);

    args[propName] = {
      name: member.name,
      description: (member as any).summary || member.description,
      defaultValue,
      control: enabled && !member.readonly && control ? control : false,
      options,
      table: {
        category: "properties",
        defaultValue: {
          summary: JSON.stringify(defaultValue),
        },
        type: {
          summary: type,
        },
      },
      type: sbType,
    };
  });

  // remove ref property if it exists
  delete args["ref"];

  return { resets, args };
}

export function getReactEvents(component?: Component): ArgSet {
  const args: ArgTypes = {};

  component?.events?.forEach((event) => {
    const eventName = `on${event.name}`;
    args[eventName] = {
      name: eventName,
      description: (event as any).summary || event.description,
      control: false,
      table: {
        category: "events",
      },
    };
  });

  return { args };
}

export function getCssProperties(
  component?: Component,
  enabled = true,
): ArgSet {
  const resets: ArgTypes = {};
  const args: ArgTypes = {};

  component?.cssProperties?.forEach((part) => {
    resets[part.name] = {
      name: part.name,
      table: {
        disable: true,
      },
    };
  });

  component?.cssProperties?.forEach((property) => {
    args[property.name] = {
      name: property.name,
      description: (property as any).summary || property.description,
      defaultValue: property.default,
      control: enabled ? getCssPropControl(property) : false,
      table: {
        category: "css properties",
      },
    };
  });

  return { resets, args };
}

function getCssPropControl(
  property: CssCustomProperty,
): StorybookControl | undefined {
  const config: StorybookHelpersOptions =
    (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
  const type = (property as any).type?.text?.toLowerCase();
  const name = property.name?.toLowerCase();

  if (config.useCssPropTypes) {
    if (type === "<color>") return "color";
    if (type === "<integer>" || type === "<number>") return "number";
    return "text";
  }

  if (
    name?.includes("color") ||
    name?.includes("colour") ||
    type === "<color>"
  ) {
    return "color";
  }

  if (type === "<integer>" || type === "<number>") {
    return "number";
  }

  return "text";
}

export function getCssParts(component?: Component, enabled = true): ArgSet {
  const resets: ArgTypes = {};
  const args: ArgTypes = {};

  component?.cssParts?.forEach((part) => {
    resets[part.name] = {
      name: part.name,
      table: {
        disable: true,
      },
    };

    args[`${part.name}-part`] = {
      name: part.name,
      description: getDescription(
        (part as any).summary || part.description,
        enabled ? `${part.name}-part` : "",
      ),
      control: enabled ? "text" : false,
      table: {
        category: "css shadow parts",
      },
    };
  });

  return { resets, args };
}

export function getCssStates(component?: Component, enabled = true): ArgSet {
  const resets: ArgTypes = {};
  const args: ArgTypes = {};

  component?.cssStates?.forEach((state) => {
    resets[state.name] = {
      name: state.name,
      table: {
        disable: true,
      },
    };

    args[`${state.name}-state`] = {
      name: state.name,
      description: getDescription(
        (state as any).summary || state.description,
        enabled ? `${state.name}-state` : "",
      ),
      control: enabled ? "text" : false,
      table: {
        category: "css states",
      },
    };
  });

  return { resets, args };
}

export function getSlots(component?: Component, enabled = true): ArgSet {
  const resets: ArgTypes = {};
  const args: ArgTypes = {};

  component?.slots?.forEach((slot) => {
    resets[slot.name] = {
      name: slot.name,
      table: {
        disable: true,
      },
    };

    const slotName = slot.name || "default";
    args[`${slotName}-slot`] = {
      name: slotName,
      description: getDescription(
        (slot as any).summary || slot.description,
        enabled ? `${slotName}-slot` : "",
      ),
      control: enabled ? "text" : false,
      table: {
        category: "slots",
      },
    };
  });

  return { resets, args };
}

export function getEvents(component?: Component): ArgSet {
  const args: ArgTypes = {};
  const resets: ArgTypes = {};

  component?.events?.forEach((event) => {
    resets[event.name] = {
      name: event.name,
      table: {
        disable: true,
      },
    };
  });

  const events = getComponentEventsWithType(component!);
  events?.forEach((event) => {
    args[`${event.name}-event`] = {
      name: event.name,
      description: (event as any).summary || event.description,
      control: false,
      table: {
        category: "events",
        type: {
          summary: event.type.text,
        },
      },
    };
  });

  return { resets, args };
}

export function getMethods(component?: Component): ArgSet {
  const args: ArgTypes = {};

  const methods = getComponentPublicMethods(component!);
  methods?.forEach((method) => {
    args[`${method.name}-method`] = {
      name: method.name,
      description: (method as any).summary || method.description,
      control: false,
      table: {
        category: "methods",
        type: {
          summary: method.type.text,
        },
      },
    };
  });

  return { args };
}

function getDefaultValue(control: StorybookControl, defaultValue?: string) {
  const controlType =
    typeof control === "string"
      ? control
      : typeof control === "object"
        ? control.type
        : undefined;
  if (!controlType && defaultValue === undefined) {
    // Worst case: we have no information
    return undefined;
  }
  const initialValue = removeQuotes(defaultValue || "");
  if (controlType === "boolean") {
    return initialValue === "true";
  }
  if (initialValue === "undefined") {
    return undefined;
  }
  if (initialValue === "''" || initialValue === '""') {
    return "";
  }
  if (controlType === "number") {
    return initialValue === "" ? initialValue : Number(initialValue);
  }

  if (controlType === "object" || controlType === "multi-select") {
    return initialValue && initialValue !== "undefined"
      ? safelyParseJson(initialValue)
      : undefined;
  }
  return initialValue;
}

function safelyParseJson(input: string) {
  try {
    return JSON.parse(formatToValidJson(input));
  } catch {
    return input;
  }
}

function getControl(
  type: string,
  isAttribute = false,
): {
  control: StorybookControl;
  options?: string[];
  type?: ArgTypes[string]["type"];
} {
  if (!type) {
    return isAttribute
      ? { control: "text", type: { name: "string" } }
      : { control: false };
  }

  const arrayInner = parseArrayType(type);

  const options = arrayInner ? parseOptions(arrayInner) : parseOptions(type);

  // A union may mix string literals with object/record members (e.g.
  // `'blub' | 'bla' | { test: 'string' }`). Surface the string literals as
  // select/multi-select options instead of falling back to an object control,
  // which would otherwise try to JSON.parse a literal default value (see #103).
  const literalOptions = options.filter(isStringLiteral);

  if (
    !arrayInner &&
    isObject(type) &&
    !isAttribute &&
    literalOptions.length === 0
  ) {
    return { control: "object", type: getObjectSBType(type) };
  }

  // For primitive types, if the type is an array, we must offer an object control so the user can construct their own array of primitives
  if (hasType(options, "string")) {
    return arrayInner
      ? { control: "object", type: arrayOf("string") }
      : { control: "text", type: { name: "string" } };
  }

  if (hasType(options, "boolean")) {
    return arrayInner
      ? { control: "object", type: arrayOf("boolean") }
      : { control: "boolean", type: { name: "boolean" } };
  }

  if (hasType(options, "number")) {
    return arrayInner
      ? { control: "object", type: arrayOf("number") }
      : { control: "number", type: { name: "number" } };
  }

  if (hasType(options, "date")) {
    // Storybook has no dedicated date type; dates are surfaced as strings.
    return arrayInner
      ? { control: "object", type: arrayOf("string") }
      : { control: "date", type: { name: "string" } };
  }

  if (hasType(options, "function")) {
    // Storybook has no dedicated function type; disable control
    return { control: false, type: { name: "other" } };
  }

  const hasMixedObjectUnion = literalOptions.length > 0 && isObject(type);

  if (!arrayInner && !isEnum(type) && !hasMixedObjectUnion) {
    // Type is not an array like, not an enum and none of the above. It is assumed
    // to be a custom type, therefore control is disabled because we cannot infer anything
    return { control: false };
  }

  // base case, type is a union of literals (optionally mixed with object members)
  const enumValues = literalOptions.map((option) => removeQuotes(option));
  return arrayInner
    ? {
        control: "multi-select",
        options: enumValues,
        type: { name: "array", value: { name: "enum", value: enumValues } },
      }
    : {
        control: "select",
        options: enumValues,
        type: { name: "enum", value: enumValues },
      };
}
// matches -> 'one' | 'two' | 'three'
const singleQuoteEnumRegex =
  /^\s*'(?:\\'|[^'])*'\s*(?:\|\s*'(?:\\'|[^'])*'\s*)*$/i;
// matches -> "one" | "two" | "three"
const doubleQuoteEnumRegex =
  /^\s*"(?:\\"|[^"])*"\s*(?:\|\s*"(?:\\"|[^"])*"\s*)*$/i;

function isEnum(type: string): boolean {
  return singleQuoteEnumRegex.test(type) || doubleQuoteEnumRegex.test(type);
}

function isStringLiteral(option: string): boolean {
  return option.startsWith("'") || option.startsWith('"');
}

function arrayOf(scalar: "string" | "number" | "boolean") {
  return { name: "array" as const, value: { name: scalar } };
}

// matches -> string[] | number[] | boolean[]
const primitiveArrayRegex = /^(string|number|boolean)\s*\[\]$/i;
// matches -> Array<string> | Array<number> | Array<boolean>
const primitiveArrayGenericRegex = /^Array<\s*(string|number|boolean)\s*>$/i;

function getObjectSBType(type: string) {
  const match =
    type.match(primitiveArrayRegex) ?? type.match(primitiveArrayGenericRegex);
  if (match) {
    return arrayOf(match[1].toLowerCase() as "string" | "number" | "boolean");
  }
  return { name: "object" as const, value: {} };
}

// matches -> Array< union | of | types >
const arrayMultiRegex = /^Array<([^>]*\|[^>]*)>$/;
// matches -> (union | of | types)[]
const tupleMultiRegex = /^\(([^)]*\|[^)]*)\)\[\]$/;

function parseArrayType(type: string) {
  const arrayMatch = type.match(arrayMultiRegex);
  if (arrayMatch?.[1]) {
    return arrayMatch[1];
  }

  const tupleMatch = type.match(tupleMultiRegex);
  if (tupleMatch?.[1]) {
    return tupleMatch[1];
  }
}

function parseOptions(type: string) {
  return type
    .split("|")
    .map((x) => x.trim())
    .map((x) => (x.startsWith("'") || x.startsWith('"') ? x : x.toLowerCase()))
    .filter((x) => x !== "" && x !== "null" && x !== "undefined");
}

function isObject(type: string) {
  return (
    type.toLowerCase().includes("array") ||
    type.toLowerCase().includes("object") ||
    type.includes("{") ||
    type.includes("[") ||
    type.includes("<")
  );
}

function hasType(values: string[] = [], type: string) {
  return values?.find((value) => value === type) !== undefined;
}

function cleanUpType(type?: string): string {
  return !type
    ? ""
    : type
        .replace(" | undefined", "")
        .replace(" | null", "")
        .replace(" | void", "")
        .replace(" | any", "")
        .replace(" | unknown", "")
        .replace(" | string & {}", "|")
        .replace(" | (string & {})", "|")
        .replace(" | string", "|")
        .replace(" | number", "|")
        .replace(" | boolean", "|")
        .replace(" | object", "|")
        .replace(" | Function", "|")
        .replace(" | {}", "|")
        .replace(" | []", "|");
}

function getDescription(
  description?: string,
  argRef?: string,
  deprecated?: string,
) {
  let desc = getMemberDescription(description, deprecated);

  return helpersOptions.hideArgRef || !argRef
    ? desc
    : (desc += `\n\n\narg ref - \`${argRef}\``);
}

/**
 * Converts a JavaScript-like object string into valid JSON format.
 * @param input The input string to format.
 * @returns A valid JSON string.
 */
function formatToValidJson(input: string): string {
  return (
    input
      // Replace single quotes around values with double quotes
      .replace(/'([^']+)'/g, '"$1"')
      // Add double quotes around unquoted keys
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
      // Remove trailing commas before closing braces/brackets
      .replace(/,\s*(}|])/g, "$1")
  );
}
