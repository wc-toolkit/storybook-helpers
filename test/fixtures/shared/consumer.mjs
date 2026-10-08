import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));

/** Runs a bounded consumer command, propagating errors and capturing output. */
export function run(cwd, command, args, environment = {}) {
  return execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      STORYBOOK_DISABLE_TELEMETRY: "1",
      CI: "1",
      ...environment,
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180_000,
  });
}

/** Builds and packs the library so consumers exercise published artifacts. */
export function pack(workspace) {
  run(root, "npm", ["run", "build"]);

  const [{ filename }] = JSON.parse(
    run(root, "npm", [
      "pack",
      "--ignore-scripts",
      "--json",
      "--pack-destination",
      workspace,
    ]),
  );

  return join(workspace, filename);
}

/** Installs the local artifact without changing the fixture's lockfile. */
export function installPackedHelpers(consumer, tarball) {
  return run(consumer, "npm", [
    "install",
    "--no-save",
    "--package-lock=false",
    "--no-audit",
    "--no-fund",
    tarball,
  ]);
}

/** Copies a fixture into an isolated consumer with locked dependencies. */
export function createConsumer(fixture, workspace, tarball, extraFiles = []) {
  const consumer = join(workspace, "consumer");

  for (const path of [
    ".storybook",
    "src",
    "manifest.json",
    "package.json",
    "package-lock.json",
    ...extraFiles,
  ]) {
    cpSync(join(fixture, path), join(consumer, path), { recursive: true });
  }

  run(consumer, "npm", ["ci", "--no-audit", "--no-fund"]);
  installPackedHelpers(consumer, tarball);

  return consumer;
}

/** Prepares a runnable fixture with the current local package. */
export function setup(fixture) {
  const workspace = mkdtempSync(join(tmpdir(), "storybook-helpers-pack-"));

  try {
    console.log(installPackedHelpers(fixture, pack(workspace)));
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}
