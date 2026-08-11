---
"@wc-toolkit/storybook-helpers": patch
---

Fix crash for union types containing both string literals and an object type

When a property is typed as a union like `'blub' | 'bla' | { test: 'string' }` with a string literal default, the control resolved to "object" and `getDefaultValue` called `JSON.parse` on the raw literal, throwing `SyntaxError`. The control now resolves to a "select" with the string literal options, and `getDefaultValue` guards the `JSON.parse` so an unparseable default falls back to the raw string instead of throwing.
