import path from "path";

/*
 * storybookHelpersReloader
 * ------------------------
 * Small Storybook preset that ensures Storybook's dev server watches the
 * Custom Elements Manifest (custom-elements.json) and triggers a reload
 * when it changes. Works for Vite (sends a full-reload over the websocket)
 * and Webpack 5 (adds the file to compilation.fileDependencies).
 */

export interface CEMWatchOptions {
  /** Path to the custom-elements.json file relative to storybook configDir (recommended) */
  path?: string;
  /** Enable or disable the reloader (default: true) */
  enabled?: boolean;
}

function resolveManifestPath(configDir?: string, override?: string): string {
  const base = configDir ? path.resolve(configDir) : process.cwd();
  return path.resolve(base, override || "custom-elements.json");
}

// ---- Vite plugin factory ----
function createViteCEMPlugin(manifestPath: string) {
  type ViteWatcherLike = {
    add: (p: string) => void;
    on: (ev: string, cb: (file: string) => void) => void;
  };
  type ViteWSLike = { send: (payload: unknown) => void };
  type ViteServerLike = { watcher: ViteWatcherLike; ws: ViteWSLike };

  return {
    name: "wc-toolkit-reloader",
    configureServer(server: unknown) {
      const s = server as ViteServerLike;
      try {
        s.watcher.add(manifestPath);
        s.watcher.on("change", (file: string) => {
          if (file === manifestPath) {
            s.ws.send({ type: "full-reload" });
          }
        });
      } catch {
        // best-effort; don't crash Storybook if watcher API differs
      }
    },
  };
}

// ---- Webpack plugin ----
class WatchCEMWebpackPlugin {
  private manifestPath: string;
  constructor(manifestPath: string) {
    this.manifestPath = manifestPath;
  }

  apply(compiler: unknown) {
    // Minimally-typed compiler/compilation interfaces to avoid heavy webpack deps
    type CompilationLike = { fileDependencies?: Set<string> | Array<string> };
    type CompilerLike = {
      hooks: {
        afterCompile: {
          tap: (
            name: string,
            cb: (compilation: CompilationLike) => void,
          ) => void;
        };
      };
    };

    const c = compiler as CompilerLike;
    c.hooks.afterCompile.tap(
      "WatchCEMWebpackPlugin",
      (compilation: CompilationLike) => {
        try {
          const fd = compilation.fileDependencies as unknown;
          if (fd && typeof (fd as { add?: unknown }).add === "function") {
            (fd as Set<string>).add(this.manifestPath);
          } else if (Array.isArray(fd)) {
            (fd as Array<string>).push(this.manifestPath);
          }
        } catch {
          // ignore; best-effort
        }
      },
    );
  }
}

export function storybookHelpersReloader(opts: CEMWatchOptions = {}) {
  const { path: overridePath, enabled = true } = opts;

  function viteFinal(
    existingConfig: Record<string, unknown> | unknown,
    { configDir }: { configDir?: string },
  ) {
    if (!enabled) {
      return existingConfig as unknown;
    }
    const manifestPath = resolveManifestPath(configDir, overridePath);
    const plugin = createViteCEMPlugin(manifestPath);
    const cfg = existingConfig as Record<string, unknown>;
    return {
      ...cfg,
      plugins: [...((cfg?.plugins as unknown[]) || []), plugin],
    };
  }

  function webpackFinal(
    existingConfig: Record<string, unknown> | unknown,
    { configDir }: { configDir?: string },
  ) {
    if (!enabled) {
      return existingConfig as unknown;
    }
    const manifestPath = resolveManifestPath(configDir, overridePath);
    const pluginInstance = new WatchCEMWebpackPlugin(manifestPath);
    const cfg = existingConfig as Record<string, unknown>;
    return {
      ...cfg,
      plugins: [...((cfg?.plugins as unknown[]) || []), pluginInstance],
    };
  }

  return { viteFinal, webpackFinal };
}
