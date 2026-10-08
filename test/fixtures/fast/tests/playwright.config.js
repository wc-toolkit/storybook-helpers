/**
 * Lets Playwright manage built and live Storybook servers for the isolated consumer.
 */

import { defineConfig } from "@playwright/test";
import { storybookConfig } from "../../shared/playwright.config.mjs";

export default defineConfig(
  storybookConfig({
    cwd: process.env.FAST_CONSUMER,
    testMatch: ["render.pw.js", "category-order.pw.js"],
    production: 6008,
    development: 6009,
  }),
);
