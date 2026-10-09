/**
 * Installs the local packed helpers into the example without changing its lockfile.
 */
import { assertNoLit, fixture } from "./tests/consumer.mjs";
import { setup } from "../shared/consumer.mjs";

setup(fixture);
assertNoLit(fixture);
