import { test, expect } from "@playwright/test";
test("installed web build can reload offline with saved records and local sources", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Cat Compass");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.getByRole("navigation").getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Offline cat");
  await context.setOffline(true); await page.reload();
  await expect(page.getByRole("heading", { name: "Life is better with Offline cat." })).toBeVisible();
  await page.getByRole("navigation").getByRole("button", { name: "Sources", exact: true }).click();
  await expect(page.locator(".source-card").first()).toBeVisible();
  await expect(page.locator(".source-card")).toHaveCount(31);
  await context.setOffline(false);
});
test("manifest has installable local icons and no third-party app requests", async ({ page }) => {
  const requests: string[] = []; page.on("request", r => requests.push(r.url())); await page.goto("/");
  const manifest = await page.request.get("/manifest.webmanifest"); const data = await manifest.json();
  expect(data.display).toBe("standalone"); expect(data.icons.map((i: { sizes: string }) => i.sizes)).toContain("512x512");
  for (const icon of data.icons) expect((await page.request.get("/" + icon.src)).ok()).toBe(true);
  expect(requests.filter(u => /^https?:/.test(u) && !u.startsWith("http://localhost:5197"))).toEqual([]);
});
