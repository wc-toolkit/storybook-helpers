import { defineConfig } from "@playwright/test";

import { storybookConfig } from "../../shared/playwright.config.mjs";

export default defineConfig(
  storybookConfig({
    cwd: process.env.LIT_CONSUMER,
    testMatch: "category-order.pw.js",
    production: 6011,
  }),
);
