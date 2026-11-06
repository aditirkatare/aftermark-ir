import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("four screens pass automated accessibility and responsive widths", async ({
  page,
}) => {
  for (const route of [
    "/incidents",
    "/incidents/INC-103",
    "/memory?incident=INC-103",
    "/replay",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, route).toEqual([]);
    for (const width of [1920, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${route} at ${width}`,
      ).toBeLessThanOrEqual(width);
    }
    await page.setViewportSize({ width: 1366, height: 768 });
  }
});
test("INC-103 hero, provenance, diagnostic and handover", async ({ page }) => {
  await page.goto("/incidents/INC-103");
  await expect(page.getByText("Previously worked. Now blocked.")).toBeVisible();
  for (const reason of ["FLAG_ABSENT", "ENV_DRIFT", "CONTRADICTING_TELEMETRY"])
    await expect(page.getByText(reason, { exact: true })).toBeVisible();
  await page.screenshot({
    path: "screenshots/incident-desktop-viewport.png",
    fullPage: false,
  });
  const cta = page.getByRole("button", { name: "Review diagnostic" });
  const box = await cta.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(768);
  await expect(
    page.getByRole("button", { name: /apply|override/i }),
  ).toHaveCount(0);
  await page.screenshot({
    path: "screenshots/incident-desktop.png",
    fullPage: true,
  });
  await cta.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Record simulated approval" }).click();
  await expect(
    page.getByText(/Outcome: unknown. Retention: not_requested/),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(cta).toBeFocused();
  await page.getByRole("button", { name: "Generate handover" }).click();
  await expect(page.getByRole("dialog")).toContainText("Owner: Unassigned");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "View memory source" }).click();
  await expect(
    page.getByText("No provider calls recorded.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("None — synthetic fixture adapter"),
  ).toBeVisible();
  await page.screenshot({
    path: "screenshots/memory-desktop.png",
    fullPage: true,
  });
});
test("mode switches remove historical recall and navigation works", async ({
  page,
}) => {
  await page.goto("/incidents/INC-103");
  await page.getByLabel("Memory for analysis").selectOption("memory_off");
  await expect(
    page.getByText("Current evidence. Action blocked."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View memory source" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Replay Lab", exact: true }).click();
  await expect(
    page.getByText("M0 · Current evidence only", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("M2 · Memory + validity gate", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Preview scenario").selectOption("INC-102");
  await expect(
    page.getByText("Compatible history. Review before use."),
  ).toBeVisible();
  await page.screenshot({
    path: "screenshots/replay-desktop.png",
    fullPage: true,
  });
});
test("queue filters, direct links and browser history", async ({ page }) => {
  await page.goto("/incidents");
  await page.getByLabel("Search incident or service").fill("103");
  await expect(page.getByRole("link", { name: "INC-102 →" })).toHaveCount(0);
  await page.screenshot({
    path: "screenshots/queue-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "INC-103 →", exact: true }).click();
  await page.goBack();
  await expect(page.getByLabel("Search incident or service")).toHaveValue(
    "103",
  );
  await page.goto("/incidents/invalid");
  await expect(
    page.getByRole("heading", { name: "Incident not found" }),
  ).toBeVisible();
  await page.goto("/memory");
  await expect(
    page.getByRole("heading", { name: "Choose incident context" }),
  ).toBeVisible();
});
test("mobile and 320px reflow; keyboard dialog and axe", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/incidents/INC-103");
  await expect(page.getByText("Previously worked. Now blocked.")).toBeVisible();
  await page.screenshot({
    path: "screenshots/incident-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.setViewportSize({ width: 320, height: 768 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: "Review diagnostic" }).click();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Record simulated approval" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Review diagnostic" }),
  ).toBeFocused();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
