/** Checks fragment rendering, template bindings, and Storybook-driven args. */
import { expect, test } from "@playwright/test";

test("renders FAST and responds to Storybook args", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/iframe.html?id=fast-metadata--default&viewMode=story");
  const label = page.locator('fast-greeting [part="label"]');
  await expect(label).toHaveText("Hello FAST");
  await expect(page.locator("fast-greeting")).toHaveCSS("display", "block");
  await expect(page.locator("wc-toolkit-fast-story")).toHaveCount(0);
  expect(
    await page.evaluate(() => customElements.get("wc-toolkit-fast-story")),
  ).toBeUndefined();

  if (testInfo.project.name === "development") {
    for (const value of ["Updated FAST", "Hello FAST"]) {
      await page.evaluate((label) => {
        globalThis.__STORYBOOK_PREVIEW__.channel.emit("updateStoryArgs", {
          storyId: "fast-metadata--default",
          updatedArgs: { label },
        });
      }, value);

      await expect(label).toHaveText(value);
    }
  }

  expect(errors).toEqual([]);
});

test("binds properties, slots and scoped style controls", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/iframe.html?id=fast-metadata--controls&viewMode=story");
  const element = page.locator("fast-greeting");
  await expect(element.locator("#data")).toHaveText("Object binding");
  await expect(element).toHaveAttribute("disabled", "");
  await expect(element).toHaveJSProperty("count", 0);
  await expect(element).toHaveCSS("padding-top", "0px");
  await expect(element).toHaveCSS("border-top-width", "3px");
  await expect(element.locator('[part="label"]')).toHaveCSS(
    "color",
    "rgb(255, 0, 0)",
  );
  await expect(element.locator("strong")).toHaveText("Default slot");
  await expect(element.locator('[slot="header"]')).toHaveText("Named slot");
  expect(
    await element
      .locator('[slot="header"]')
      .evaluate((node) => node.assignedSlot?.name),
  ).toBe("header");
  await expect(element).toHaveAttribute("data-story", /fast-story-/);
  expect(errors).toEqual([]);
});

test("logs template-bound Actions without automatically updating Controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/iframe.html?id=fast-metadata--default&viewMode=story");
  await expect(page.locator('fast-greeting [part="label"]')).toHaveText(
    "Hello FAST",
  );
  await page.evaluate(() => {
    globalThis.recordedActions = [];
    globalThis.recordedArgUpdates = [];
    globalThis.__STORYBOOK_PREVIEW__.channel.on(
      "storybook/actions/action-event",
      (event) => globalThis.recordedActions.push(event),
    );
    globalThis.__STORYBOOK_PREVIEW__.channel.on("updateStoryArgs", (event) => {
      globalThis.recordedArgUpdates.push(event);
    });
  });

  await page.getByRole("button", { name: "Update from component" }).click();
  await expect(page.locator('fast-greeting [part="label"]')).toHaveText(
    "From component",
  );
  await expect
    .poll(() => page.evaluate(() => globalThis.recordedActions.length))
    .toBe(1);
  expect(
    await page.evaluate(() => globalThis.recordedActions[0].data.name),
  ).toBe("greeting-change");

  await page.evaluate(async () => {
    document.querySelector("fast-greeting").data = {
      message: "Component property update",
    };
    await new Promise(requestAnimationFrame);
  });
  await expect(page.locator("fast-greeting #data")).toHaveText(
    "Component property update",
  );
  expect(await page.evaluate(() => globalThis.recordedArgUpdates)).toEqual([]);
  expect(await page.evaluate(() => globalThis.component)).toBeUndefined();
  expect(errors).toEqual([]);
});
