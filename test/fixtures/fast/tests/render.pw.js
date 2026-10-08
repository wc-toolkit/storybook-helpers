/**
 * Checks FAST rendering in both builds and control updates in the Vite dev server.
 */

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

  if (testInfo.project.name === "development") {
    await page.evaluate(() => {
      globalThis.__STORYBOOK_PREVIEW__.channel.emit("updateStoryArgs", {
        storyId: "fast-metadata--default",
        updatedArgs: { label: "Updated FAST" },
      });
    });
    await expect(label).toHaveText("Updated FAST");
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
  expect(
    await page.evaluate(
      () => globalThis.component === document.querySelector("fast-greeting"),
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("lets Storybook rerender component-to-Controls round trips", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "development",
    "Requires live Storybook args updates.",
  );
  await page.goto("/iframe.html?id=fast-metadata--default&viewMode=story");
  const element = page.locator("fast-greeting");
  await expect(element.locator('[part="label"]')).toHaveText("Hello FAST");

  await page.evaluate(() => {
    globalThis.roundTripUpdates = [];
    globalThis.originalData = document.querySelector("fast-greeting").data;
    globalThis.__STORYBOOK_PREVIEW__.channel.on("storyArgsUpdated", (event) => {
      globalThis.roundTripUpdates.push(event.args);
    });
  });

  for (const label of ["Changed", "Hello FAST"]) {
    await page.evaluate((value) => {
      globalThis.roundTripElement = document.querySelector("fast-greeting");
      globalThis.roundTripElement.label = value;
    }, label);
    await expect
      .poll(() =>
        page.evaluate(
          (value) =>
            globalThis.roundTripUpdates.some((args) => args.label === value),
          label,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.querySelector("fast-greeting") !==
            globalThis.roundTripElement,
        ),
      )
      .toBe(true);
    await expect(element.locator('[part="label"]')).toHaveText(label);
  }

  for (const restore of [false, true]) {
    await page.evaluate((reset) => {
      globalThis.roundTripElement = document.querySelector("fast-greeting");
      globalThis.roundTripElement.data = reset
        ? globalThis.originalData
        : { message: "Changed property" };
    }, restore);
    const message = restore ? "Default data" : "Changed property";
    await expect
      .poll(() =>
        page.evaluate(
          (value) =>
            globalThis.roundTripUpdates.some(
              (args) => args.data?.message === value,
            ),
          message,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.querySelector("fast-greeting") !==
            globalThis.roundTripElement,
        ),
      )
      .toBe(true);
    await expect(element.locator("#data")).toHaveText(message);
  }
});

test("logs events, syncs reflected attributes and cleans up old views", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/iframe.html?id=fast-metadata--default&viewMode=story");
  await expect(page.locator('fast-greeting [part="label"]')).toHaveText(
    "Hello FAST",
  );
  await page.evaluate(() => {
    globalThis.previousElement = document.querySelector("fast-greeting");
    globalThis.recordedActions = [];
    globalThis.recordedArgUpdates = [];
    globalThis.__STORYBOOK_PREVIEW__.channel.on(
      "storybook/actions/action-event",
      (event) => {
        globalThis.recordedActions.push(event);
      },
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
  await expect
    .poll(() =>
      page.evaluate(() =>
        globalThis.recordedArgUpdates.some(
          (event) => event.updatedArgs.label === "From component",
        ),
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    document.querySelector("fast-greeting").data = {
      message: "Observable control update",
    };
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        globalThis.recordedArgUpdates.some(
          (event) =>
            event.updatedArgs.data?.message === "Observable control update",
        ),
      ),
    )
    .toBe(true);
  if (testInfo.project.name === "production") {
    expect(errors).toEqual([]);
    return;
  }
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.querySelector("fast-greeting") !==
          globalThis.previousElement,
      ),
    )
    .toBe(true);
  await page.evaluate(async () => {
    globalThis.previousElement.setAttribute("label", "Stale mutation");
    globalThis.previousElement.data = { message: "Stale property" };
    globalThis.previousElement.dispatchEvent(
      new CustomEvent("greeting-change", { bubbles: true }),
    );
    await new Promise(requestAnimationFrame);
  });
  await expect(page.locator('fast-greeting [part="label"]')).toHaveText(
    "From component",
  );
  expect(await page.evaluate(() => globalThis.recordedActions.length)).toBe(1);
  expect(
    await page.evaluate(() =>
      globalThis.recordedArgUpdates.some(
        (event) => event.updatedArgs.label === "Stale mutation",
      ),
    ),
  ).toBe(false);
  expect(
    await page.evaluate(() =>
      globalThis.recordedArgUpdates.some(
        (event) => event.updatedArgs.data?.message === "Stale property",
      ),
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});
