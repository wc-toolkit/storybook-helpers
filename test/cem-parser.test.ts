import { describe, it, expect } from "vitest";
import {
  getAttributesAndProperties,
  getCssParts,
  getCssProperties,
  getCssStates,
  getReactProperties,
  getSlots,
} from "../src/cem-parser.js";
import {
  attrComponent,
  propComponent,
  makeComponent,
} from "./helpers/make-component.js";

const FIELD = "value";

describe("getAttributesAndProperties — primitive controls", () => {
  it("returns a text control for string", () => {
    const { attrArgs } = getAttributesAndProperties(attrComponent("string"));
    expect(attrArgs[FIELD].control).toBe("text");
    expect(attrArgs[FIELD].options).toBeUndefined();
  });

  it("returns a boolean control for boolean", () => {
    const { attrArgs } = getAttributesAndProperties(attrComponent("boolean"));
    expect(attrArgs[FIELD].control).toBe("boolean");
  });

  it("returns a number control for number", () => {
    const { attrArgs } = getAttributesAndProperties(attrComponent("number"));
    expect(attrArgs[FIELD].control).toBe("number");
  });

  it("returns a date control for Date", () => {
    const { attrArgs } = getAttributesAndProperties(attrComponent("Date"));
    expect(attrArgs[FIELD].control).toBe("date");
  });

  it("strips '| undefined' / '| null' before resolving the control", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("string | undefined | null"),
    );
    expect(attrArgs[FIELD].control).toBe("text");
  });
});

describe("getAttributesAndProperties — union of literals (select)", () => {
  it("returns a select control with the literal values as options", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("'small' | 'medium' | 'large'"),
    );
    expect(attrArgs[FIELD].control).toBe("select");
    expect(attrArgs[FIELD].options).toEqual(["small", "medium", "large"]);
  });

  it("preserves the original casing of literal members", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("'TopLeft' | 'BottomRight'"),
    );
    expect(attrArgs[FIELD].options).toEqual(["TopLeft", "BottomRight"]);
  });
});

describe("getAttributesAndProperties — array of literal unions (multi-select)", () => {
  it("returns a multi-select control for `Array<'a' | 'b' | 'c'>`", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("Array<'a' | 'b' | 'c'>"),
    );
    expect(attrArgs[FIELD].control).toBe("multi-select");
  });

  it("exposes the literal options for `Array<'a' | 'b' | 'c'>`", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("Array<'a' | 'b' | 'c'>"),
    );
    expect(attrArgs[FIELD].options).toEqual(["a", "b", "c"]);
  });

  it("returns a multi-select control for `('a' | 'b' | 'c')[]`", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("('a' | 'b' | 'c')[]"),
    );
    expect(attrArgs[FIELD].control).toBe("multi-select");
  });

  it("exposes the literal options for `('a' | 'b' | 'c')[]`", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("('a' | 'b' | 'c')[]"),
    );
    expect(attrArgs[FIELD].options).toEqual(["a", "b", "c"]);
  });
});

describe("getAttributesAndProperties — arrays of primitives", () => {
  it("returns an object control for `string[]` when exposed as a property", () => {
    const { propArgs } = getAttributesAndProperties(
      propComponent("string[]", { default: "[]" }),
    );
    expect(propArgs[FIELD].control).toBe("object");
  });

  it("returns an object control for `number[]` when exposed as a property", () => {
    const { propArgs } = getAttributesAndProperties(
      propComponent("number[]", { default: "[]" }),
    );
    expect(propArgs[FIELD].control).toBe("object");
  });

  it("returns an object control for `Array<string>` when exposed as a property", () => {
    const { propArgs } = getAttributesAndProperties(
      propComponent("Array<string>", { default: "[]" }),
    );
    expect(propArgs[FIELD].control).toBe("object");
  });
});

describe("getAttributesAndProperties — object controls", () => {
  it("returns an object control for `{ foo: string }` properties", () => {
    const { propArgs } = getAttributesAndProperties(
      propComponent("{ foo: string }", { default: "{}" }),
    );
    expect(propArgs[FIELD].control).toBe("object");
  });

  it("returns an object control for `Object` (case-insensitive) properties", () => {
    const { propArgs } = getAttributesAndProperties(
      propComponent("Object", { default: "{}" }),
    );
    expect(propArgs[FIELD].control).toBe("object");
  });
});

describe("getAttributesAndProperties — default values", () => {
  it("coerces `'true'` to the boolean true for boolean controls", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("boolean", { default: "true" }),
    );
    expect(attrArgs[FIELD].defaultValue).toBe(true);
  });

  it("coerces non-true booleans to false", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("boolean", { default: "false" }),
    );
    expect(attrArgs[FIELD].defaultValue).toBe(false);
  });

  it("unwraps quoted string defaults for text controls", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("string", { default: "'hello'" }),
    );
    expect(attrArgs[FIELD].defaultValue).toBe("hello");
  });

  it("normalizes an empty-string literal default to ''", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("string", { default: "''" }),
    );
    expect(attrArgs[FIELD].defaultValue).toBe("");
  });

  it("uses the unwrapped literal as the default for select controls", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("'a' | 'b'", { default: "'a'" }),
    );
    expect(attrArgs[FIELD].defaultValue).toBe("a");
  });

  it("returns undefined defaultValue for readonly members", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("string", { default: "'hello'", readonly: true }),
    );
    expect(attrArgs[FIELD].defaultValue).toBeUndefined();
  });

  it("parses object defaults via JSON for object controls", () => {
    const { propArgs } = getAttributesAndProperties(
      propComponent("Object", { default: `{ foo: 'bar' }` }),
    );
    expect(propArgs[FIELD].defaultValue).toEqual({ foo: "bar" });
  });

  it("does not throw when an object-control field has no default value", () => {
    expect(() =>
      getAttributesAndProperties(propComponent("Object")),
    ).not.toThrow();
  });
});

describe("getAttributesAndProperties — visibility and metadata", () => {
  it("skips private, protected, and static members", () => {
    const { attrArgs, propArgs, resets } = getAttributesAndProperties(
      makeComponent({
        fields: [
          {
            name: "privateField",
            privacy: "private",
            type: { text: "string" },
          },
          {
            name: "protectedField",
            privacy: "protected",
            type: { text: "string" },
          },
          { name: "staticField", static: true, type: { text: "string" } },
          { name: "publicField", type: { text: "string" } },
        ],
      }),
    );

    expect(attrArgs.privateField).toBeUndefined();
    expect(attrArgs.protectedField).toBeUndefined();
    expect(attrArgs.staticField).toBeUndefined();
    expect(propArgs.publicField).toBeDefined();
    // resets are still registered for every field so they can be cleared in
    // re-render scenarios
    expect(resets?.privateField).toBeDefined();
  });

  it("uses the attribute name (not the field name) when an attribute exists", () => {
    const component = makeComponent({
      fields: [{ name: "docsHint", type: { text: "string" } }],
      attributes: [{ name: "docs-hint", fieldName: "docsHint" }],
    });

    const { attrArgs } = getAttributesAndProperties(component);
    expect(attrArgs["docs-hint"]).toBeDefined();
    expect(attrArgs["docs-hint"].name).toBe("docs-hint");
    expect(attrArgs.docsHint).toBeUndefined();
  });

  it("marks the control as `false` when generation is disabled", () => {
    const { attrArgs } = getAttributesAndProperties(
      attrComponent("string"),
      /* enabled */ false,
    );
    expect(attrArgs[FIELD].control).toBe(false);
  });

  it("places fields with an attribute in `attrArgs` and the rest in `propArgs`", () => {
    const component = makeComponent({
      fields: [
        { name: "label", type: { text: "string" } },
        { name: "data", type: { text: "Object" }, default: "{}" },
      ],
      attributes: [{ name: "label", fieldName: "label" }],
    });

    const { attrArgs, propArgs } = getAttributesAndProperties(component);
    expect(attrArgs.label).toBeDefined();
    expect(propArgs.data).toBeDefined();
    expect(propArgs.label).toBeUndefined();
    expect(attrArgs.data).toBeUndefined();
  });

  it("records the original type text on the argType table", () => {
    const { attrArgs } = getAttributesAndProperties(attrComponent("'a' | 'b'"));
    expect(attrArgs[FIELD].table?.type?.summary).toBe("'a' | 'b'");
  });

  it("categorizes attribute args as `attributes`", () => {
    const { attrArgs } = getAttributesAndProperties(attrComponent("string"));
    expect(attrArgs[FIELD].table?.category).toBe("attributes");
  });

  it("categorizes property-only args as `properties`", () => {
    const { propArgs } = getAttributesAndProperties(
      propComponent("Object", { default: "{}" }),
    );
    expect(propArgs[FIELD].table?.category).toBe("properties");
  });
});

describe("getReactProperties — control resolution", () => {
  it("treats every field as a property (no attribute distinction)", () => {
    const { args } = getReactProperties(attrComponent("string"));
    expect(args[FIELD].control).toBe("text");
    expect(args[FIELD].table?.category).toBe("properties");
  });

  it("returns an object control for `string[]`", () => {
    const { args } = getReactProperties(
      propComponent("string[]", { default: "[]" }),
    );
    expect(args[FIELD].control).toBe("object");
  });

  it("returns an object control for `{ foo: string }`", () => {
    const { args } = getReactProperties(
      propComponent("{ foo: string }", { default: "{}" }),
    );
    expect(args[FIELD].control).toBe("object");
  });

  it("returns a multi-select control for `Array<'a' | 'b'>`", () => {
    const { args } = getReactProperties(
      propComponent("Array<'a' | 'b'>", { default: "[]" }),
    );
    expect(args[FIELD].control).toBe("multi-select");
  });

  it("returns a select control for a union of string literals", () => {
    const { args } = getReactProperties(propComponent("'a' | 'b' | 'c'"));
    expect(args[FIELD].control).toBe("select");
    expect(args[FIELD].options).toEqual(["a", "b", "c"]);
  });

  it("removes the synthetic `ref` property", () => {
    const component = makeComponent({
      fields: [
        { name: "ref", type: { text: "string" } },
        { name: "label", type: { text: "string" } },
      ],
    });
    const { args } = getReactProperties(component);
    expect(args.ref).toBeUndefined();
    expect(args.label).toBeDefined();
  });

  it("coerces `'true'` to the boolean true for boolean controls", () => {
    const { args } = getReactProperties(
      propComponent("boolean", { default: "true" }),
    );
    expect(args[FIELD].defaultValue).toBe(true);
  });
});

describe("getCssProperties", () => {
  it("picks the color control for properties whose name contains 'color'", () => {
    const { args } = getCssProperties(
      makeComponent({
        cssProperties: [{ name: "--primary-color", default: "#fff" }],
      }),
    );
    expect(args["--primary-color"].control).toBe("color");
  });

  it("picks the color control for the British 'colour' spelling", () => {
    const { args } = getCssProperties(
      makeComponent({
        cssProperties: [{ name: "--card-background-colour" }],
      }),
    );
    expect(args["--card-background-colour"].control).toBe("color");
  });

  it("picks the color control for declared `<color>` types", () => {
    const { args } = getCssProperties(
      makeComponent({
        cssProperties: [
          { name: "--accent", type: { text: "<color>" } } as never,
        ],
      }),
    );
    expect(args["--accent"].control).toBe("color");
  });

  it("picks the number control for `<integer>` / `<number>` types", () => {
    const { args } = getCssProperties(
      makeComponent({
        cssProperties: [
          { name: "--span", type: { text: "<integer>" } } as never,
          { name: "--size", type: { text: "<number>" } } as never,
        ],
      }),
    );
    expect(args["--span"].control).toBe("number");
    expect(args["--size"].control).toBe("number");
  });

  it("falls back to a text control", () => {
    const { args } = getCssProperties(
      makeComponent({
        cssProperties: [
          { name: "--border-style", type: { text: "<string>" } } as never,
        ],
      }),
    );
    expect(args["--border-style"].control).toBe("text");
  });

  it("disables the control when generation is disabled", () => {
    const { args } = getCssProperties(
      makeComponent({
        cssProperties: [{ name: "--primary-color" }],
      }),
      /* enabled */ false,
    );
    expect(args["--primary-color"].control).toBe(false);
  });
});

describe("getCssParts", () => {
  it("namespaces css parts with the `-part` suffix", () => {
    const { args } = getCssParts(
      makeComponent({ cssParts: [{ name: "button" }] }),
    );
    expect(args["button-part"]).toBeDefined();
    expect(args["button-part"].table?.category).toBe("css shadow parts");
  });
});

describe("getCssStates", () => {
  it("namespaces css states with the `-state` suffix", () => {
    const { args } = getCssStates(
      makeComponent({ cssStates: [{ name: "active" }] }),
    );
    expect(args["active-state"]).toBeDefined();
    expect(args["active-state"].table?.category).toBe("css states");
  });
});

describe("getSlots", () => {
  it("treats an unnamed slot as the `default` slot", () => {
    const { args } = getSlots(
      makeComponent({ slots: [{ name: "" }, { name: "icon" }] }),
    );
    expect(args["default-slot"]).toBeDefined();
    expect(args["icon-slot"]).toBeDefined();
  });
});
