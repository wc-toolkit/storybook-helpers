import { getTsProgram, typeParserPlugin } from "@wc-toolkit/type-parser";

export default {
  /** Globs to analyze */
  globs: ["demo/src/**/*.ts"],
  /** Directory to output CEM to */
  outdir: "demo",
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: false,
  plugins: [typeParserPlugin({ debug: false })],
  overrideModuleCreation({ ts, globs }) {
    const program = getTsProgram(ts, globs, "tsconfig.json");
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },
};
