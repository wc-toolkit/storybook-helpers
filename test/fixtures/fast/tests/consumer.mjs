/**
 * FAST-specific type fixtures and dependency checks.
 */

import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createConsumer as createPackedConsumer,
  run,
} from "../../shared/consumer.mjs";

export const fixture = fileURLToPath(new URL("../", import.meta.url));

/**
 * Installs the locked example and packed helpers outside repository dependency ancestry.
 */
export function createConsumer(workspace, tarball) {
  const consumer = createPackedConsumer(fixture, workspace, tarball, [
    "tests/core-adapter.ts",
    "tests/fast-adapter.ts",
    "tests/tsconfig.json",
  ]);

  const packageJson = JSON.parse(
    readFileSync(join(consumer, "package.json"), "utf8"),
  );

  packageJson.scripts.typecheck = "tsc -p tests/tsconfig.json";

  // Retain the packed package when the later controls uninstall FAST.
  packageJson.devDependencies["@wc-toolkit/storybook-helpers"] = tarball;

  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  return consumer;
}

/**
 * Rejects installed Lit packages or web-components renderers anywhere in the dependency tree.
 */
export function assertNoLit(consumer) {
  const tree = JSON.parse(run(consumer, "npm", ["ls", "--all", "--json"]));

  function check(dependencies = {}) {
    for (const [name, data] of Object.entries(dependencies)) {
      assert.ok(
        ![
          "lit",
          "lit-html",
          "lit-element",
          "@storybook/web-components",
          "@storybook/web-components-vite",
        ].includes(name) || !data.version,
        `Unexpected ${name} in consumer dependency tree: ${JSON.stringify(data)}`,
      );

      check(data.dependencies);
    }
  }
  check(tree.dependencies);
}
