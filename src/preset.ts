import path from "path";

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

  function viteFinal(existingConfig: unknown, { configDir }: { configDir?: string }) {
    if (!enabled) return existingConfig as unknown;
    const manifestPath = resolveManifestPath(configDir, overridePath);

    type ViteWatcherLike = {
      add: (p: string) => void;
      on: (ev: string, cb: (file: string) => void) => void;
    };
    type ViteWSLike = { send: (payload: unknown) => void };
    type ViteServerLike = { watcher: ViteWatcherLike; ws: ViteWSLike };

    const plugin = {
      name: "wc-toolkit-watch-cem",
      configureServer(server: unknown) {
        const s = server as ViteServerLike;
        try {
          // ensure watcher is aware of the file and trigger a full reload when it changes
          s.watcher.add(manifestPath);
          s.watcher.on("change", (file: string) => {
            if (file === manifestPath) {
              s.ws.send({ type: "full-reload" });
            }
          });
        } catch {
          // ignore; best-effort
        }
      },
    };

    const cfg = existingConfig as Record<string, unknown>;
    return {
      ...cfg,
      plugins: [...((cfg?.plugins as unknown[]) || []), plugin],
    };
  }

  function webpackFinal(existingConfig: unknown, { configDir }: { configDir?: string }) {
    if (!enabled) return existingConfig as unknown;
    const manifestPath = resolveManifestPath(configDir, overridePath);

    type CompilationLike = { fileDependencies?: Set<string> | Array<string> };
    type CompilerLike = { hooks: { afterCompile: { tap: (name: string, cb: (compilation: CompilationLike) => void) => void } } };

    class WatchCEMWebpackPlugin {
      apply(compiler: unknown) {
        const c = compiler as CompilerLike;
        c.hooks.afterCompile.tap("WatchCEMWebpackPlugin", (compilation: CompilationLike) => {
          try {
            // Some webpack versions expose fileDependencies as a Set
            const fd = compilation.fileDependencies as unknown;
            if (fd && typeof (fd as { add?: unknown }).add === "function") {
              (fd as Set<string>).add(manifestPath);
            } else if (Array.isArray(fd)) {
              (fd as Array<string>).push(manifestPath);
            }
          } catch {
            // ignore; best-effort
          }
        });
      }
    }

    const pluginInstance = new WatchCEMWebpackPlugin();
    const cfg = existingConfig as Record<string, unknown>;
    return {
      ...cfg,
      plugins: [...((cfg?.plugins as unknown[]) || []), pluginInstance],
    };
  }

  return {
    viteFinal,
    webpackFinal,
  };
}
