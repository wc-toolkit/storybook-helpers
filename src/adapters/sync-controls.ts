import { useArgs } from "storybook/preview-api";
import type { getAttributesAndProperties } from "../cem-parser.js";

type Attributes = ReturnType<typeof getAttributesAndProperties>["attrArgs"];

/** Captures Storybook's updater during render; attach once the element exists. */
export function syncControls(
  attributes: Attributes,
  args?: Record<string, unknown>,
) {
  const [, updateArgs] = useArgs();

  return (element: HTMLElement) =>
    setArgObserver(element, attributes, updateArgs, args);
}

/** Observes declared attributes; the owner must disconnect the returned observer. */
export function setArgObserver(
  element: HTMLElement,
  attributes: Attributes,
  updateArgs: (args: Record<string, unknown>) => void,
  args?: Record<string, unknown>,
) {
  const observer = new MutationObserver((mutations) => {
    const changed: Record<string, unknown> = {};

    for (const { attributeName } of mutations) {
      const entry = Object.entries(attributes).find(
        ([, arg]) => arg.name === attributeName,
      );

      if (!entry || attributeName === null) continue;

      const [key, arg] = entry;
      const type = typeof arg.type === "object" ? arg.type.name : arg.type;
      const raw = element.getAttribute(attributeName);
      const value =
        type === "boolean"
          ? element.hasAttribute(attributeName)
          : type === "number"
            ? Number(raw)
            : raw;

      if (!args || !Object.is(args[key], value)) changed[key] = value;
    }

    if (Object.keys(changed).length) updateArgs(changed);
  });

  observer.observe(element, {
    attributes: true,
    attributeFilter: Object.values(attributes).map((arg) => String(arg.name)),
  });

  return observer;
}
