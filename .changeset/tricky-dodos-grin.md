---
"@wc-toolkit/storybook-helpers": minor
---

feat: add `useCssPropTypes` config option to infer CSS custom property controls from CEM type instead of property name heuristics

When `setStorybookHelpersConfig({ useCssPropTypes: true })` is set, `getCssPropControl` relies only on the CSS type (`<color>`, `<number>`, `<integer>`) declared in the `@cssproperty` JSDoc tag to determine the Storybook control. The name-based heuristic (`name.includes("color")` / `name.includes("colour")`) is skipped, avoiding false positives for properties like `--colour-distance` or `--profile-icon-colour`.
