import { test, expect } from "@playwright/test";
test("menu, settings, all modes, pause, hold and scores", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173/afterdrop/");
  await expect(
    page.getByRole("heading", { name: "Find your flow." }),
  ).toBeVisible();
  await page.locator("#customize").click();
  await page.locator("#palette").selectOption("neon");
  await page.locator("#depth").uncheck();
  await page.locator("#close-modal").click();
  await page.reload();
  await page.locator("#customize").click();
  await expect(page.locator("#palette")).toHaveValue("neon");
  await expect(page.locator("#depth")).not.toBeChecked();
  await page.locator("#palette").selectOption("citrus");
  await page.locator("#depth").check();
  await page.locator("#close-modal").click();
  for (const mode of ["marathon", "sprint", "ultra", "zen"]) {
    await page.locator(`[data-mode="${mode}"]`).click();
    await page.locator("#start").click();
    await expect(page.locator("#board")).toBeVisible();
    await page.keyboard.press("c");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Space");
    await expect(page.locator("#score")).not.toHaveText("0");
    await page.locator("#pause").click();
    const t = await page.locator("#time").textContent();
    await page.waitForTimeout(1100);
    await expect(page.locator("#time")).toHaveText(t!);
    await page.locator("#resume").click();
    await page.locator("#pause").click();
    await page.locator("#exit").click();
  }
  expect(errors).toEqual([]);
  await page.locator("[data-mode=marathon]").click();
  await page.screenshot({ path: "public/menu-preview.png", fullPage: true });
});
test("mobile has no overflow and touch actions work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:5173/afterdrop/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("#start").click();
  await page.locator('[data-action="hold"]').click();
  await page.locator('[data-action="drop"]').click();
  await expect(page.locator("#score")).not.toHaveText("0");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "public/mobile-preview.png", fullPage: true });
});
