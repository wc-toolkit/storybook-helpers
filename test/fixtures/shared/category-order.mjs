/** Checks category ordering and exclusions in Storybook's rendered Docs table. */
export async function expectCategoryOrder(page, expect, storyId) {
  await page.goto(`/iframe.html?id=${storyId}--docs&viewMode=docs`);

  const table = page.getByRole("table");
  await expect(table).toHaveCount(1);

  const categories = table.locator("tbody tr").filter({
    has: page.locator("td[colspan]"),
  });

  await expect(categories).toHaveCount(6);
  await expect(categories).toContainText([
    "slots",
    "properties",
    "attributes",
    "css properties",
    "css shadow parts",
    "events",
  ]);

  await expect(table.getByText("css states", { exact: true })).toHaveCount(0);
  await expect(table.getByText("ready", { exact: true })).toHaveCount(0);
  await expect(table.getByText("label", { exact: true }).first()).toBeVisible();
}
