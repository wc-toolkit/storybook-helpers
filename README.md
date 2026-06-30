<div align="center">

![workbench with tools, html, css, javascript, and storybook logo](https://raw.githubusercontent.com/wc-toolkit/storybook-helpers/refs/heads/main/assets/wc-toolkit_storybook.png)

</div>

# WC Toolkit Storybook Helpers

These helpers are designed to make integrating Web Components with Storybook easier.

There are a number of things that this helper library does to provide developers a better experience with Storybook and Web Components:

1. Uses types to provide better controls for properties and CSS custom properties
2. Prevents name collisions when attributes, properties, slots, and CSS shadow parts share the same name
3. Provides a template with bindings for attributes, properties, CSS custom properties, and CSS shadow parts.
4. Provides two-way binding for controls and attributes in the template to help keep control values in sync with the component

<div styles="display:flex;justify-content:center;align-items:center;">
  <a href="https://stackblitz.com/edit/github-fkmbdscn?file=README.md">
    <img
      alt="Open in StackBlitz"
      src="https://developer.stackblitz.com/img/open_in_stackblitz.svg"
    />
  </a>
</div>

Be sure to check out the [official docs](https://wc-toolkit.com/integrations/storybook/) for more information on how to configure and use this.

## Before You Install

1. If you don't already have it installed, follow the installation steps in the [Storybook docs](https://storybook.js.org/docs/web-components/get-started/install) for web components

```bash
npm create storybook@latest
```

1. Generate a Custom Elements Manifest (CEM) for your web components. If you're not already generating one, [here are some tools you can use](https://dev.to/stuffbreaker/you-should-be-shipping-a-manifest-with-your-web-components-2da0#how-do-you-create-a-cem).

2. Load your custom elements manifest into Storybook in the `.storybook/preview.ts` (or `.js`) file:

```js
// .storybook/preview.ts
import { setCustomElementsManifest } from "@storybook/web-components-vite";
// Import from your project root or build output
import manifest from "../custom-elements.json" with { type: "json" };

setCustomElementsManifest(manifest);
```

4. Add the expanded controls to your config in the `.storybook/preview.ts` (or `.js`) file:

```js
export const parameters = {
  ...
  controls: {
    expanded: true,
    ...
  },
}
```

## Installation

Now that you have Storybook installed, you can install the helpers:

```bash
npm i -D @wc-toolkit/storybook-helpers
```

Next, set the `setStorybookHelpersConfig` in the `.storybook/preview.ts` (or `.js`) file:

```ts
// preview.ts
import { setStorybookHelpersConfig } from "@wc-toolkit/storybook-helpers";

setStorybookHelpersConfig();
```

You can also pass in global configuration:

```ts
// preview.ts
import { setStorybookHelpersConfig, type Options } from "@wc-toolkit/storybook-helpers";

const options: Options = {...}

setStorybookHelpersConfig(options);
```

## Setup

Import the storybook helpers into your story and get the appropriate helpers by passing your element's tag name into the Storybook helper function.

The function will return the helper data you can assign to the Storybook `meta` object.

```ts
// my-element.stories.ts
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers";
import type { MyElement } from "./my-element.js"; // Import your element's type
import "./my-element.js"; // Import your element

// The type parameter helps TypeScript understand your component's API
const { args, argTypes, template } =
  getStorybookHelpers<MyElement>("my-element");

const meta: Meta<MyElement> = {
  title: "Components/My Element",
  component: "my-element",
  args,
  argTypes,
  render: (args) => template(args),
};
export default meta;
```

### Returned Values

The `getStorybookHelpers` function returns an object with the following properties:

- **`args`**: Default values for all component properties, attributes, slots, CSS properties, and parts
- **`argTypes`**: Configuration object for Storybook controls based on your Custom Elements Manifest
- **`template`**: Function that renders your component with two-way data binding between Storybook controls and your component's API
- **`logEvent`**: Function to manually log events in the Actions panel
- **`events`** (deprecated): Array of event names - use `logEvent` instead in Storybook v10+

### Story Options

You can pass options as the second parameter to customize individual stories:

```ts
const { args, argTypes, template } = getStorybookHelpers<MyElement>(
  "my-element",
  {
    excludeCategories: ["methods", "cssStates"], // Hide specific categories
    setComponentVariable: true, // Access element via `component` variable
  },
);
```

Available options:

- **`excludeCategories`**: Array of categories to hide (`"attributes"`, `"properties"`, `"slots"`, `"cssProps"`, `"cssParts"`, `"cssStates"`, `"methods"`, `"events"`)
- **`setComponentVariable`**: Creates a global `component` variable for the element instance

## Usage Examples

### Creating Story Variations

```ts
export const Default: Story = {};

export const WithCustomLabel: Story = {
  args: {
    label: "Custom Label",
    count: 10,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
```

### Using Slots

The `template` function accepts a second parameter for slot content:

```ts
import { html } from "lit";

export const WithSlotContent: Story = {
  render: (args) =>
    template(args, html`<p>This content goes in the default slot</p>`),
};
```

### Customizing CSS Properties

CSS custom properties appear as controls and can be modified:

If your Custom Elements Manifest includes typed `@cssprop` declarations, Storybook Helpers will choose a better control automatically:

- `@cssprop {<color>}` or CSS property names that include `color` or `colour` use the `color` control
- `@cssprop {<number>}` and `@cssprop {<integer>}` use the `number` control
- All other CSS custom properties fall back to the `text` control

```ts
/**
 * @cssprop {<color>} [--card-border-color=#ccc] - The card border color
 * @cssprop {<number>} [--card-elevation=1] - Elevation depth
 * @cssprop {<length>} [--card-border-radius=8px] - The card border radius
 */
```

```ts
export const CustomStyling: Story = {
  args: {
    "--card-border-color": "#ff0000",
    "--card-border-elevation": "2",
    "--card-border-radius": "16px",
  },
};
```

### Scoping CSS to a story (per-story, scoped styles)

Some components expose many CSS custom properties. Enable `useScopedStyles` to have helpers generate scoped CSS blocks instead of inline style args. When enabled, helpers:

- Add a per-story attribute (data-story="scope-1", scope-2, ... ) to the rendered element
- Rewrite generated selectors so they target `:scope` inside the component
- Wrap the rules in an `@scope (selector) { ... }` block (the selector is parenthesized as required)
- Indent the contents by two spaces for readability

Enable it in `.storybook/preview.ts`:

```ts
import { setStorybookHelpersConfig } from "@wc-toolkit/storybook-helpers";
setStorybookHelpersConfig({ useScopedStyles: true });
```

Example emitted CSS (simplified):

```css
@scope (my-element[data-story="scope-1"]) {
  :scope {
    --card-border-color: #ff0000;
    --card-border-radius: 12px;
  }
}
```

Behavior notes:

- Styles are injected per-story and removed when the story unmounts; this avoids leaking to other stories.
- The helpers add a short `data-story` id (scope-1, scope-2, ...) instead of long random strings.
- The MutationObserver used to sync controls ignores unknown attributes and skips updates while the helpers are updating, preventing render loops when the data attribute is added.
- Browser support for `@scope` is limited; use a build-time transform (PostCSS) if you need broader compatibility.

### Using CSS Shadow Parts

CSS shadow parts allow styling internal elements from outside:

```ts
export const StyledParts: Story = {
  args: {
    "button-part": "background: blue; color: white;",
  },
};
```

### Manually Logging Events

If you're not using the `template` helper, manually log events for the "Actions" panel:

```ts
const { logEvent } = getStorybookHelpers<MyElement>("my-element");

export const CustomRender: Story = {
  render: (args) => html`
    <my-element
      @my-event=${(e: Event) => logEvent("my-event", e)}
      @count=${(e: Event) => logEvent("count", e)}
    >
    </my-element>
  `,
};
```

### Accessing the Component Instance

Enable `setComponentVariable` to access the element in your browser console:

```ts
const { args, argTypes, template } = getStorybookHelpers<MyElement>(
  "my-element",
  {
    setComponentVariable: true,
  },
);

// In your browser console, you can now access:
// component.someMethod()
// component.someProperty = value
```

## Automatic Custom Elements Manifest reload

The helpers now include a reloader that watches your Custom Elements Manifest (custom-elements.json) and forces Storybook to reload the iframe when the manifest changes. This is enabled by default.

Usage:

- Add the preset to your Storybook main config (.storybook/main.ts or .storybook/main.js):

```ts
// .storybook/main.ts
import { storybookHelpersReloader } from "@wc-toolkit/storybook-helpers";

export default {
  // ...other Storybook config
  presets: [storybookHelpersReloader()],
};
```

- To customize the manifest path or disable the feature (path-first API — recommended):

```ts
presets: [
  // watches the file at the given path relative to your Storybook configDir
  storybookHelpersReloader({
    path: "../build/custom-elements.json",
    enabled: true,
  }),
];
```

Behavior:

- Vite: registers a Vite plugin that watches the manifest and issues a full-reload via the Vite server websocket when the file changes.
- Webpack 5: adds the manifest to webpack's fileDependencies so the dev server will pick up changes and rebuild.

If your Storybook uses a non-standard config directory, the preset resolves the manifest relative to Storybook's configDir by default.

## Troubleshooting

### "Custom Elements Manifest not found" Error

This error means the Custom Elements Manifest hasn't been loaded. Ensure you:

1. Generated a `custom-elements.json` file using [@custom-elements-manifest/analyzer](https://custom-elements-manifest.open-wc.org/)
2. Imported and set the manifest in `.storybook/preview.ts` using `setCustomElementsManifest(manifest)`

### Controls Not Showing Up

Make sure you:

1. Set `controls: { expanded: true }` in your Storybook config
2. Your Custom Elements Manifest includes JSDoc comments for your component's properties, attributes, events, etc.

### TypeScript Errors with Template

If you get TypeScript errors, ensure:

1. You're importing your element's type: `import type { MyElement } from './my-element.js'`
2. You're passing the type to `getStorybookHelpers<MyElement>("my-element")`
3. Your element class is exported from its module

Be sure to check out the [official docs](https://wc-toolkit.com/integrations/storybook/) for more information on how to configure and use this.
