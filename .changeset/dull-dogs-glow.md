---
"@wc-toolkit/storybook-helpers": patch
---

Fix Storybook RangeControl crash when overriding number props with range control

- `cem-parser.ts`: coerce number defaults from string to actual Number type
- `storybook-helpers.ts`: fix `|| ""` fallback that swallowed falsy values like `0`
- `html-templates.ts`: parse attribute values as numbers in `syncControls` observer
