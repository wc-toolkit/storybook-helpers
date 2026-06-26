---
"@wc-toolkit/storybook-helpers": patch
---

Add `storybookHelpersReloader` - an automatic Custom Elements Manifest watcher for Vite and a webpack file-watch fallback. Export a helper preset (storybookHelpersPreset) that augments Storybook's viteFinal and webpackFinal to watch the manifest and trigger reloads. Default enabled.
