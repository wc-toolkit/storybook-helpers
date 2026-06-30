# @wc-toolkit/storybook-helpers

## 10.5.0

### Minor Changes

- 3477b89: Add `useScopedStyles` option to emit per-story scoped CSS via `@scope`. When enabled the helpers add a short `data-story` attribute to the rendered element, rewrite selectors to target `:scope`, and wrap rules in an `@scope (selector) { ... }` block with two-space indentation for readability. The changes also include fixes to prevent MutationObserver-triggered re-render loops and improve docs formatting.

## 10.4.0

### Minor Changes

- ae1d98f: Add support for disabling the propagation of attribute changes to Storybook URL params

## 10.3.2

### Patch Changes

- eb7968e: simplify category ordering
- c0250c7: fixed categoryOrder support

## 10.3.1

### Patch Changes

- e95769c: Add `storybookHelpersReloader` - an automatic Custom Elements Manifest watcher for Vite and a webpack file-watch fallback. Export a helper preset (storybookHelpersPreset) that augments Storybook's viteFinal and webpackFinal to watch the manifest and trigger reloads. Default enabled.
- 900b4c8: Made `setStorybookHelpersConfig` options optional.

## 10.3.0

### Minor Changes

- 4155670: Added typing lookup for `cssProperties`. If your Custom Elements Manifest includes typed `@cssprop` declarations, Storybook Helpers will choose a better control automatically:

  - `@cssprop {<color>}` or CSS property names that include `color` or `colour` use the `color` control
  - `@cssprop {<number>}` and `@cssprop {<integer>}` use the `number` control
  - All other CSS custom properties fall back to the `text` control

## 10.2.3

### Patch Changes

- 6fccd93: Do not overwrite event handlers from args with logEvent-handler

## 10.2.2

### Patch Changes

- d10f4d9: Fix typo in `argsObserver` variable name in `syncControls` function.

## 10.2.1

### Patch Changes

- 98603e1: Added stability to the `args` observer

## 10.2.0

### Minor Changes

- c619a28: Updated `template` to capture events in "Actions" panel

### Patch Changes

- c619a28: Added `logEvent` helper to manually log events to the "Actions" panel
- c619a28: Deprecated the `events` property as the actions handler is no longer supported

## 10.0.0

### Major Changes

- 71fdac7: Updated exports to be ESM only in order to make storybook-helpers compatible with Storybook v10

## 9.0.1

### Patch Changes

- c733b62: Resolved a slot template issue preventing non-text slots from rendering

## 9.0.0

### Major Changes

- 70578b4: Upgrade package to support Storybook v9

## 1.1.5

### Patch Changes

- 02c3c29: Fixed issue with `querySelector` when using `component` variable

## 1.1.4

### Patch Changes

- 89a26ed: Adjusts ArgTypes export to source from Storybook

## 1.1.3

### Patch Changes

- e8c4db0: Resolves an issue where non properties were throwing type errors (slots, cssprops, etc)
- f7ac995: Fixes an incorrect import path in the documentation

## 1.1.2

### Patch Changes

- 00494f5: added readonly support for properties

## 1.1.1

### Patch Changes

- 1e0f97a: Add type parameter to getStorybookHelpers so that types match Meta<T> from Storybook.

## 1.1.0

### Minor Changes

- 30a24ef: Added ability to set component variable at the component level using `setComponentVariable`

### Patch Changes

- 30a24ef: Added parser and formatter for properties with an object default value

## 1.0.4

### Patch Changes

- b3d876f: Fexed error where hidden categories still display the default values in the `args`
- b3d876f: Fixed error when omitting CSS Props from story
- b3d876f: Fixed error where empty content is slotted when the `slots` category is hidden

## 1.0.3

### Patch Changes

- eb08aa0: Fixed issue where attributes are not removed when the default value is used

## 1.0.2

### Patch Changes

- 52ce9a7: Removed duplicate event entries in the control table

## 1.0.1

### Patch Changes

- 1eaa523: Fixed links in README to doc site
- 1eaa523: Fixed CSS block rendering when content comes from controls
- 1eaa523: Fixed slot rendering when content comes from controls

## 1.0.0

### Major Changes

- c76a7ca: Initial commit
