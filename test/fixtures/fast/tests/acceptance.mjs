/**
 * Verifies packed helpers in an isolated FAST consumer, then checks renderer independence.
 */

import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { assertNoLit, createConsumer, fixture } from "./consumer.mjs";
import { pack, run } from "../../shared/consumer.mjs";

test(
  "packed FAST helpers type-check, build and render without Lit",
  { timeout: 600_000 },
  () => {
    const workspace = mkdtempSync(join(tmpdir(), "storybook-helpers-fast-"));

    try {
      const consumer = createConsumer(workspace, pack(workspace));

      assertNoLit(consumer);
      run(consumer, "npm", ["run", "typecheck"]);
      run(consumer, "npm", ["run", "build"]);

      console.log(
        run(fixture, "npm", ["run", "test:browser"], {
          FAST_CONSUMER: consumer,
        }),
      );

      // Metadata itself requires neither rendering library.
      rmSync(join(consumer, "tests/fast-adapter.ts"));
      run(consumer, "npm", [
        "uninstall",
        "@microsoft/fast-element",
        "--no-audit",
        "--no-fund",
      ]);
      assert.equal(
        existsSync(join(consumer, "node_modules/@microsoft/fast-element")),
        false,
      );
      run(consumer, "npm", ["run", "typecheck"]);
      run(consumer, "node", [
        "--input-type=module",
        "-e",
        'import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers/core"; console.log(typeof getStorybookHelpers);',
      ]);
      assertNoLit(consumer);

      // Root remains Lit-specific, but its types must not require a renderer.
      rmSync(join(consumer, "tests/core-adapter.ts"));
      run(consumer, "npm", ["install", "--no-audit", "--no-fund", "lit@3.2.1"]);
      cpSync(
        join(fixture, "tests/lit-adapter.ts"),
        join(consumer, "tests/lit-adapter.ts"),
      );
      run(consumer, "npm", ["run", "typecheck"]);
      assert.equal(
        existsSync(join(consumer, "node_modules/@storybook/web-components")),
        false,
      );
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  },
);
