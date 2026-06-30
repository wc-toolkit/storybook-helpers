---
"@wc-toolkit/storybook-helpers": minor
---

Add `useScopedStyles` option to emit per-story scoped CSS via `@scope`. When enabled the helpers add a short `data-story` attribute to the rendered element, rewrite selectors to target `:scope`, and wrap rules in an `@scope (selector) { ... }` block with two-space indentation for readability. The changes also include fixes to prevent MutationObserver-triggered re-render loops and improve docs formatting.
