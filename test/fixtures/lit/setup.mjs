/** Installs the local packed helpers for running the Lit fixture. */
import { fileURLToPath } from "node:url";
import { setup } from "../shared/consumer.mjs";

setup(fileURLToPath(new URL("./", import.meta.url)));
