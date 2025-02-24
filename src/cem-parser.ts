/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMemberDescription, removeQuotes } from "@wc-toolkit/cem-utilities";
import type { ArgTypes, ControlOptions } from "./storybook-types";
import type { Options } from "./types";
import type { Component } from "@wc-toolkit/cem-utilities";

let options: Options = {};

setTimeout(() => {
  options = (globalThis as any)?.__WC_STORYBOOK_HELPERS_CONFIG__ || {};
});

export function getAttributesAndProperties(
  component?: Component,
  enabled = true
): ArgTypes {
  const properties: ArgTypes = {};

  component?.members?.forEach((member) => {
    if (member.kind !== "field") {
      return;
    }

    const attribute = component.attributes?.find(
      (x) => member.name === x.fieldName
    );
    const propName = member.name;

    properties[propName] = {
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
    const defaultValue = removeQuotes(member.default || "");

    properties[name] = {
      name: name,
      description: getDescription(
        member.description,
        propName,
        member.deprecated as string
      ),
      defaultValue: defaultValue === "''" ? "" : defaultValue,
      control: enabled
        ? {
            type: getControl(propType, attribute !== undefined),
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
      properties[name].options = values.map((x) => removeQuotes(x)!);
    }
  });

  return properties;
}

export function getReactProperties(
  component?: Component,
  enabled = true
): ArgTypes {
  const properties: ArgTypes = {};

  component?.members?.forEach((member) => {
    if (member.kind !== "field") {
      return;
    }

    properties[member.name] = {
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

    properties[propName] = {
      name: member.name,
      description: member.description,
      defaultValue: getDefaultValue(controlType, member.default),
      control: enabled
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
      properties[propName].options = values.map((x) => removeQuotes(x)!);
    }
  });

  // remove ref property if it exists
  delete properties["ref"];

  return properties;
}

export function getReactEvents(component?: Component): ArgTypes {
  const events: ArgTypes = {};

  component?.events?.forEach((event) => {
    const eventName = `on${event.name}`;
    events[eventName] = {
      name: eventName,
      description: event.description,
      control: false,
      table: {
        category: "events",
      },
    };
  });

  return events;
}

export function getCssProperties(
  component?: Component,
  enabled = true
): ArgTypes {
  const properties: ArgTypes = {};

  component?.cssProperties?.forEach((property) => {
    properties[property.name] = {
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

  return properties;
}

export function getCssParts(component?: Component, enabled = true): ArgTypes {
  const parts: ArgTypes = {};

  component?.cssParts?.forEach((part) => {
    parts[part.name] = {
      name: part.name,
      table: {
        disable: true,
      },
    };

    parts[`${part.name}-part`] = {
      name: part.name,
      description: getDescription(
        part.description,
        enabled ? `${part.name}-part` : ""
      ),
      control: enabled ? "text" : false,
      table: {
        category: "css shadow parts",
      },
    };
  });

  return parts;
}

export function getSlots(component?: Component, enabled = true): ArgTypes {
  const slots: ArgTypes = {};

  component?.slots?.forEach((slot) => {
    slots[slot.name] = {
      name: slot.name,
      table: {
        disable: true,
      },
    };

    const slotName = slot.name || "default";
    slots[`${slotName}-slot`] = {
      name: slotName,
      description: getDescription(
        slot.description,
        enabled ? `${slotName}-slot` : ""
      ),
      control: enabled ? "text" : false,
      table: {
        category: "slots",
      },
    };
  });

  return slots;
}

export function getEvents(component?: Component): ArgTypes {
  const events: ArgTypes = {};

  component?.events?.forEach((event) => {
    events[event.name] = {
      name: event.name,
      description: event.description,
      control: false,
      table: {
        category: "events",
        type: {
          summary: `CustomEvent${event.type ? `<${event.type.text}>` : ""}`,
        },
      },
    };
  });

  return events;
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
  deprecated?: string
) {
  let desc = getMemberDescription(description, deprecated);

  return options.hideArgRef || !argRef
    ? desc
    : (desc += `\n\n\narg ref - \`${argRef}\``);
}
