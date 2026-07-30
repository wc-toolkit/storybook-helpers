---
"@wc-toolkit/storybook-helpers": patch
---

Fix: args using property name (camelCase) now work when the component's attribute name differs from the property name (e.g., `docsHint` property with `docs-hint` attribute)

Previously, the argType was only registered under the attribute name, so `args: { docsHint: "value" }` in a story would have no effect. Now the argType is also registered under the property name, allowing property-name-based args to set the corresponding property on the element.
