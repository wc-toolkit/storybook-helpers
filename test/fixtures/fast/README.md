# FASTElement + Storybook HTML/Vite

Uses `/fast` helpers for metadata, generated FAST templates and rendering with
`@storybook/html-vite`. **No Lit required.**

## Run

```sh
# From the repository root:
pnpm install --frozen-lockfile
cd test/fixtures/fast
npm ci
npm run setup
npm run storybook
```

Open <http://localhost:6007>.
Rerun `npm run setup` after changing helpers; it installs the local packed package.
Use `npm run build` for a production build.

## Test

```sh
# From this directory, after npm ci:
npx playwright install chromium
npm test
```

Keep ports **6008 and 6009** free. On Linux, use
`npx playwright install --with-deps chromium` if system dependencies are missing.

The test installs the locked example and packed helpers in a temporary directory,
then verifies types, build, browser rendering, and args updates without Lit.
The `Category order` Docs page exercises Storybook's real Controls table:
`slots` and `properties` come first, omitted categories follow in default order,
and excluded CSS states are absent. Tests cover both production and development.
Separate controls check `/core` without FAST and root types with explicit Lit.
Packed-consumer setup, Playwright configuration, and category-table assertions
are shared with the Lit fixture in [`../shared`](../shared).
[Adapter unit tests](../../adapters/fast/templates.test.ts) mirror
Lit's CSS-part, CSS-state and scoped-style cases; run them with root `npm test`.

## Source

- [Story](src/metadata.stories.js): generated helper renderer and control values.
- [Component](src/fast-greeting.js): registered FAST template and styles.
- [Preview](.storybook/preview.js): manifest configuration.

For API scope and the root import's Lit requirement, see the
[main README](../../../README.md#fastelement).
