# @wc-toolkit/storybook-helpers

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
