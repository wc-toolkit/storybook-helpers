---
"@wc-toolkit/storybook-helpers": minor
---

Added typing lookup for `cssProperties`. If your Custom Elements Manifest includes typed `@cssprop` declarations, Storybook Helpers will choose a better control automatically:

- `@cssprop {<color>}` or CSS property names that include `color` or `colour` use the `color` control
- `@cssprop {<number>}` and `@cssprop {<integer>}` use the `number` control
- All other CSS custom properties fall back to the `text` control
