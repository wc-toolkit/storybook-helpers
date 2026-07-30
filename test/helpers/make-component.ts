import type { Component } from "@wc-toolkit/cem-utilities";
import type { ClassField, Attribute } from "custom-elements-manifest";

type FieldOptions = Partial<ClassField> & {
  name: string;
  type?: { text: string };
};

/**
 * Build a minimal `Component` (CEM `CustomElement`) object suitable for
 * passing into the cem-parser helpers.
 */
export function makeComponent(opts: {
  fields?: FieldOptions[];
  attributes?: Array<Partial<Attribute> & { name: string; fieldName?: string }>;
  cssProperties?: Component["cssProperties"];
  cssParts?: Component["cssParts"];
  cssStates?: Component["cssStates"];
  slots?: Component["slots"];
  events?: Component["events"];
}): Component {
  const members = (opts.fields ?? []).map((f) => ({
    kind: "field",
    ...f,
  }));

  return {
    kind: "class",
    name: "TestElement",
    tagName: "test-element",
    members,
    attributes: opts.attributes,
    cssProperties: opts.cssProperties,
    cssParts: opts.cssParts,
    cssStates: opts.cssStates,
    slots: opts.slots,
    events: opts.events,
  } as unknown as Component;
}

/**
 * Build a single-field component where the field has both a backing attribute
 * (so it is exposed via the `attributes` argTypes bucket) and the given type
 * text + default value.
 */
export function attrComponent(
  type: string,
  init: Partial<ClassField> = {},
): Component {
  return makeComponent({
    fields: [
      {
        name: "value",
        type: { text: type },
        ...init,
      },
    ],
    attributes: [{ name: "value", fieldName: "value" }],
  });
}

/**
 * Build a single-field component where the field has NO backing attribute
 * (so it is exposed via the `properties` argTypes bucket).
 */
export function propComponent(
  type: string,
  init: Partial<ClassField> = {},
): Component {
  return makeComponent({
    fields: [
      {
        name: "value",
        type: { text: type },
        ...init,
      },
    ],
  });
}
