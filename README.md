<div align="center">
  
![workbench with tools, html, css, javascript, and typescript logos](https://raw.githubusercontent.com/wc-toolkit/type-parser/refs/heads/main/assets/wc-toolkit_ts.png)

</div>

# WC Toolkit Type Parser

Using type aliases to define the types for your component’s APIs, can be helpful for keeping your code clean and organized as well as making your types reusable.

The down-side is that it can be difficult to integrate with other tooling or communicate in documentation what the available options are. 
This plugin parses the types so they available in a more usable format.

## Installation

```bash
npm i -D @wc-toolkit/type-parser
```

## Usage

Using type aliases to define the types for your component's APIs, can be helpful for keeping your code clean and organized as well as making your types reusable.

```ts
// my-component.ts

type Target = '_blank' | '_self' | '_parent' | '_top';

class MyLink extends HTMLElement {
  target?: Target;
}
```

This plugin parses the types for your component APIs in Custom Elements Manifest using the [Custom Element Manifest Analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/).

```js
// custom-elements-manifest.config.js

import { getTsProgram, typeParserPlugin } from "@wc-toolkit/type-parser";

export default {
  ...
  // Give the plugin access to the TypeScript type checker
  overrideModuleCreation({ts, globs}) {
    const program = getTsProgram(ts, globs, "tsconfig.json");
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },

  // Add the plugin to the config
  plugins: [typeParserPlugin()],
};
```

## Result

It doesn't overwrite the existing property, but will create a new property with the parsed type value.

```json
// custom-elements.json

{
  "kind": "field",
  "name": "target",
  "description": "A lookup type for example",
  "attribute": "target",
  "type": {
    "text": "Target | undefined"
  },
  "parsedType": {
    "text": "'_blank' | '_self' | '_parent' | '_top' | undefined"
  }
}
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/stackblitz-starters-cngwm94d?file=README.md)

Be sure to check out the [official docs](https://wc-toolkit.com/documentation/type-parser) for more information on how to use this.