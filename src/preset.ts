import path from "path";
import fs from "fs";

export interface CEMWatchOptions {
  path?: string;
  enabled?: boolean;
}

function resolveManifestPath(configDir?: string, override?: string) {
  const base = configDir ? path.resolve(configDir) : process.cwd();
  return path.resolve(base, override || "custom-elements.json");
}

export function storybookHelpersPreset(opts: CEMWatchOptions = {}) {
  const { path: overridePath, enabled = true } = opts;

  function viteFinal(existingConfig: any, { configDir }: { configDir?: string }) {
    if (!enabled) return existingConfig;
    const manifestPath = resolveManifestPath(configDir, overridePath);
    const plugin = {
      name: "wc-toolkit-watch-cem",
      configureServer(server: any) {
        try {
          server.watcher.add(manifestPath);
          server.watcher.on("change", (file: string) => {
            if (file === manifestPath) {
              server.ws.send({ type: "full-reload" });
            }
          });
        } catch (e) {
          // ignore; best-effort
        }
      },
    };

    return {
      ...existingConfig,
      plugins: [...(existingConfig?.plugins || []), plugin],
    };
  }

  function webpackFinal(existingConfig: any, { configDir }: { configDir?: string }) {
    if (!enabled) return existingConfig;
    const manifestPath = resolveManifestPath(configDir, overridePath);

    class WatchCEMWebpackPlugin {
      apply(compiler: any) {
        compiler.hooks.afterCompile.tap("WatchCEMWebpackPlugin", (compilation: any) => {
          try {
            compilation.fileDependencies.add(manifestPath);
          } catch (e) {
            // File dependencies may be a set or array depending on Webpack version
            try {
              if (Array.isArray(compilation.fileDependencies)) {
                compilation.fileDependencies.push(manifestPath);
              }
            } catch (err) {
              // ignore
            }
          }
        });
      }
    }

    const pluginInstance = new WatchCEMWebpackPlugin();
    return {
      ...existingConfig,
      plugins: [...(existingConfig?.plugins || []), pluginInstance],
    };
  }

  return {
    viteFinal,
    webpackFinal,
  };
}
