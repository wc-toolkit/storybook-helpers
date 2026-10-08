import { expect, test } from "@playwright/test";
import { expectCategoryOrder } from "../../shared/category-order.mjs";

test("Docs Controls preserves configured category order and exclusions", async ({
  page,
}) => {
  await expectCategoryOrder(page, expect, "fast-category-order");
});
