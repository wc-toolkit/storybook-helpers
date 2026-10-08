# Lit comparison example

Matches the `Default` and `Controls` stories in
[`../fast`](../fast), using Lit and Storybook's
`@storybook/web-components-vite` renderer instead of FAST and `@storybook/html-vite`.

From the repository root:

```sh
npm ci --prefix test/fixtures/lit
npm run setup --prefix test/fixtures/lit
npm run storybook --prefix test/fixtures/lit
```

Setup builds and installs the local packed helpers without changing the lockfile.
To build a static Storybook, run `npm run build --prefix test/fixtures/lit`.

Both examples use equivalent manifests, properties, slots, CSS controls and events.
Lit uses the root package's `template()` directly:

```js
const { args, argTypes, template } = getStorybookHelpers("lit-greeting");

export default {
  args,
  argTypes,
  render: (args) => template(args),
};
```

FAST instead imports `/fast` and uses its returned `render` to mount the native
FAST template in Storybook's HTML renderer. Neither example needs a handwritten
story template.

## Test

From the repository root:

```sh
npm run test:lit
```

Install Chromium first with `npm exec --prefix test/fixtures/lit -- playwright install chromium`
if it is not already installed. Keep port **6011** free.

The test installs the packed helpers in an isolated temporary consumer and builds
Storybook. It asserts category order in the real Docs Controls table: `slots`
and `properties` first, omitted categories in default order, and excluded CSS
states absent. It uses the same assertions as the FAST example without changing
the helper's category-ordering implementation.
Packed-consumer setup, Playwright configuration, and category-table assertions
live in [`../shared`](../shared), alongside the FAST fixture.
