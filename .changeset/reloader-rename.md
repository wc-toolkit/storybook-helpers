---
"@wc-toolkit/storybook-helpers": patch
---

Rename the exported preset to `storybookHelpersReloader`, tidy and reorganize the implementation, and update README examples to use the new name. The reloader watches the Custom Elements Manifest and forces Storybook to reload when it changes (Vite + webpack).