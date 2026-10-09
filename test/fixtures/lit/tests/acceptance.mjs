/**
 * Verifies the real Docs Controls table against an isolated packed Lit consumer.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createConsumer, pack, run } from "../../shared/consumer.mjs";

const fixture = fileURLToPath(new URL("../", import.meta.url));

test(
  "packed Lit helpers preserve category order in the Docs Controls table",
  { timeout: 600_000 },
  () => {
    const workspace = mkdtempSync(join(tmpdir(), "storybook-helpers-lit-"));

    try {
      const consumer = createConsumer(fixture, workspace, pack(workspace));
      run(consumer, "npm", ["run", "build"]);

      console.log(
        run(fixture, "npm", ["run", "test:browser"], {
          LIT_CONSUMER: consumer,
        }),
      );
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  },
);
