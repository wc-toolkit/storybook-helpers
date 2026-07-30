---
"@wc-toolkit/storybook-helpers": patch
---

Fixes an issue where the `path` module could inadvertently be eagerly loaded in a browser environment (and fail) by changing the call to a dynamic import.
