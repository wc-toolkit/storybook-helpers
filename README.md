<div align="center">

![workbench with tools, html, css, javascript, and storybook logo](https://raw.githubusercontent.com/wc-toolkit/storybook-helpers/refs/heads/main/assets/wc-toolkit_storybook.png)

</div>

# WC Toolkit Storybook Helpers

These helpers are designed to make integrating Web Components with Storybook easier.

There are a number of things that this helper library does to provide developers a better experience with Storybook and Web Components:

1. Uses types to provide better controls
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

2. Load your custom elements manifest into Storybook in the `.storybook/preview.js` file:

```js
// .storybook/preview.js
import { setCustomElementsManifest } from "@storybook/web-components-vite";
import manifest from "./path/to/custom-elements.json" with { type: "json" };

setCustomElementsManifest(manifest);
```

3. Add the expanded controls to your config in the `.storybook/preview.js` file:

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

Next, if you have [global configurations](#global-configurations), set those in your Storybook config in the `.storybook/preview.js` file:

```ts
// preview.js
import { setStorybookHelpersConfig, type Options } from "@wc-toolkit/storybook-helpers";

const options: Options = {...}

setStorybookHelpersConfig(options);
```

## Setup

Import the storybook helpers into your story and get the appropriate helpers by passing your element's tag name into the Storybook helper function.
the function will return the helper data you can assign to the Storybook `meta` object.

```ts
// my-element.stories.ts
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers";

const { events, args, argTypes, template } = getStorybookHelpers<MyElement>("my-element");

const meta: Meta<MyElement> = {
  title: "Components/My Element",
  component: "my-element",
  args,
  argTypes,
  render: (args) => template(args),
  parameters: {
    actions: {
      handles: events,
    },
  },
};
export default meta;
```

The function returns the following:

- `events`: an array of events that will be captured in the actions tab
- `args`: this provides the default values for the component `args`
- `argTypes`: an object tha configures the controls for the component based on the data from the Custom Elements Manifest
- `template`: a function that will return a template for the component as well as provide two-way data binding for the component's API and the Storybook controls

Be sure to check out the [official docs](https://wc-toolkit.com/integrations/storybook/) for more information on how to configure and use this.
