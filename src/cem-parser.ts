/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getComponentEventsWithType,
  getComponentPublicMethods,
  getMemberDescription,
  removeQuotes,
} from "@wc-toolkit/cem-utilities";
import type { ArgTypes, ControlOptions } from "./storybook-types";
import type { Options } from "./types";
import type { Component } from "@wc-toolkit/cem-utilities";

type ArgSet = {
  resets?: ArgTypes;
  args: ArgTypes;
};

let options: Options = {};

setTimeout(() => {
  options = (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
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
    const type = options.typeRef
      ? (member as any)[`${options.typeRef}`]?.text || member?.type?.text
      : member?.type?.text;
    const propType = cleanUpType(type);
    const defaultValue = member.readonly
      ? undefined
      : removeQuotes(member.default || "");
    const control = getControl(propType, attribute !== undefined);

    args[name] = {
      name: name,
      description: getDescription(
        member.description,
        propName,
        member.deprecated as string,
      ),
      defaultValue: defaultValue
        ? defaultValue === "''"
          ? ""
          : control === "object"
            ? JSON.parse(formatToValidJson(defaultValue))
            : defaultValue
        : undefined,
      control:
        enabled && !member.readonly
          ? {
              type: control,
            }
          : false,
      table: {
        category: attribute ? "attributes" : "properties",
        defaultValue: {
          summary: defaultValue,
        },
        type: {
          summary: type,
        },
      },
    };

    const values = propType?.split("|");
    if (values && values?.length > 1) {
      args[name].options = values.map((x) => removeQuotes(x)!);
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

    const type = options.typeRef
      ? (member as any)[`${options.typeRef}`]?.text || member?.type?.text
      : member?.type?.text;
    const propType = cleanUpType(type);
    const propName = `${member.name}`;
    const controlType = getControl(propType);

    args[propName] = {
      name: member.name,
      description: member.description,
      defaultValue: getDefaultValue(controlType, member.default),
      control:
        enabled && !member.readonly
          ? {
              type: controlType,
            }
          : false,
      table: {
        category: "properties",
        defaultValue: {
          summary: removeQuotes(member.default || ""),
        },
        type: {
          summary: type,
        },
      },
    };

    const values = propType?.split("|");
    if (values && values?.length > 1) {
      args[propName].options = values.map((x) => removeQuotes(x)!);
    }
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
      description: event.description,
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
      description: property.description,
      defaultValue: property.default,
      control: enabled
        ? {
            type: property.name?.toLowerCase()?.includes("color")
              ? "color"
              : "text",
          }
        : false,
      table: {
        category: "css properties",
      },
    };
  });

  return { resets, args };
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
        part.description,
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
        state.description,
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
        slot.description,
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
      description: event.description,
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
      description: method.description,
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

function getDefaultValue(controlType: ControlOptions, defaultValue?: string) {
  const initialValue = removeQuotes(defaultValue || "");
  return controlType === "boolean"
    ? initialValue === "true"
    : initialValue === "''"
      ? ""
      : initialValue;
}

function getControl(type: string, isAttribute = false): ControlOptions {
  if (!type) {
    return "text";
  }

  const lowerType = type.toLowerCase();
  const options = lowerType
    .split("|")
    .map((x) => x.trim())
    .filter((x) => x !== "" && x !== "null" && x !== "undefined");

  if (isObject(lowerType) && !isAttribute) {
    return "object";
  }

  if (hasType(options, "boolean")) {
    return "boolean";
  }

  if (hasType(options, "number") && !hasType(options, "string")) {
    return "number";
  }

  if (hasType(options, "date")) {
    return "date";
  }

  // if types is a list of string options
  return options.length > 1 ? "select" : "text";
}

function isObject(type: string) {
  return (
    type.includes("array") ||
    type.includes("object") ||
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

  return options.hideArgRef || !argRef
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
