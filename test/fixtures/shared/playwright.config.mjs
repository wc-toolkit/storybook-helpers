import { join } from "node:path";

/** Gives Playwright ownership of isolated production and optional dev servers. */
export function storybookConfig({ cwd, testMatch, production, development }) {
  if (!cwd) throw new Error("Run npm test to prepare the packed consumer.");

  const servers = [
    {
      name: "production",
      port: production,
      command: `node node_modules/vite/bin/vite.js preview --outDir storybook-static --host 127.0.0.1 --port ${production} --strictPort`,
    },
  ];

  if (development) {
    servers.push({
      name: "development",
      port: development,
      command: `node node_modules/storybook/dist/bin/dispatcher.js dev --ci --host 127.0.0.1 --port ${development} --no-open --disable-telemetry`,
    });
  }

  return {
    testMatch,
    outputDir: join(cwd, "test-results"),
    workers: 1,
    projects: servers.map(({ name, port }) => ({
      name,
      use: { baseURL: `http://127.0.0.1:${port}` },
    })),
    webServer: servers.map(({ command, port }) => ({
      command,
      cwd,
      url: `http://127.0.0.1:${port}/index.json`,
    })),
  };
}
