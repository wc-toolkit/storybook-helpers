---
"@wc-toolkit/storybook-helpers": patch
---

Fix regression where args without a default value were omitted entirely

v10.7.2 stopped adding args whose default value resolved to `undefined` or `null` (a change made to fix the RangeControl crash for falsy `0` values). This meant args for named slots, CSS parts, CSS states, and properties/references without a declared default were left unset, which broke components that rendered those arg values directly and threw errors in Storybook.

Args with no resolvable default are now initialized to `''` again, while falsy defaults (`0`, `false`, `""`) are still preserved, so the RangeControl fix keeps working.
