---
"@wc-toolkit/storybook-helpers": patch
---

Fix crash in `getCssPartsTemplate`/`getCssStatesTemplate` when a `@csspart` or CSS state control has no arg value set

Storybook leaves an arg `undefined` when no default is set (framework-supplied default instead). `getCssPartsTemplate`/`getCssStatesTemplate` called `.replace()` on that value unconditionally, throwing `TypeError: Cannot read properties of undefined (reading 'replace')` for any component with a `@csspart`/CSS state. Both now guard against `undefined`, same as `getCssPropTemplate` already does.
