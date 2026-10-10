import { test, expect } from "@playwright/test";
test("apartment loop, notifications, upgrade and persisted save", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Apartment days." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Plant seed" }).click();
  await page.getByRole("button", { name: "Water", exact: true }).click();
  await page.clock.fastForward(46000);
  await page.getByRole("button", { name: "Harvest", exact: true }).click();
  await page
    .getByRole("button", { name: "Accept", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Fulfill order · $36" }).click();
  await expect(page.locator("#stats")).toContainText("$76");
  await page.getByRole("button", { name: "Second slot · $60" }).click();
  await expect(page.locator(".plant")).toHaveCount(2);
  await page.reload();
  await expect(page.locator("#stats")).toContainText("$16");
  await expect(page.locator(".plant")).toHaveCount(2);
  await page.screenshot({
    path: "/workspace/Weedfirm/test-results/apartment-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("button", { name: "Plant seed" })).toBeVisible();
  await page.screenshot({
    path: "/workspace/Weedfirm/test-results/apartment-mobile.png",
    fullPage: true,
  });
});
