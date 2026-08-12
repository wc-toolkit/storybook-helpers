---
"@wc-toolkit/storybook-helpers": patch
---

Scope the empty-string default fallback to workaround controls only

v10.7.6 initialized args to `''` for every control with no resolvable default. That restored CSS part/state/slot controls, but it also synthesized `''` for real component attributes and properties, which made the generated template render `.prop="${''}"` and override the component's own default values.

Now the `''` fallback only applies to the workaround categories (`css shadow parts`, `css states`, `slots`). Attributes and properties with no declared default are left unset, so components keep their own defaults. Arrow-function/custom-typed properties (e.g. `() => string`) were already excluded since they resolve to a disabled control.
