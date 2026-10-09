import { setStorybookHelpersConfig } from "@wc-toolkit/storybook-helpers/core";
import manifest from "../manifest.json";

setStorybookHelpersConfig({
  manifest,
  setComponentVariable: true,
  useScopedStyles: true,
});
