import { expect, test } from "@playwright/test";
const navigate = async (page: import("@playwright/test").Page, name: string) => page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name, exact: true }).click();
test.beforeEach(async ({ page }) => { await page.goto("/"); });

test("daily view fits and saves a daily task", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Life is better with My cat." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("checkbox", { name: "Fresh water", exact: true }).check(); await page.reload();
  await expect(page.getByRole("checkbox", { name: "Fresh water", exact: true })).toBeChecked();
});
test("profile edits persist and companions stay separate", async ({ page }) => {
  await navigate(page,"Profile"); await page.getByLabel("Name", { exact: true }).fill("Miso"); await page.reload();
  await navigate(page,"Profile"); await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Miso");
  await page.getByRole("button", { name: "Add a cat", exact: true }).click(); await page.getByLabel("Name", { exact: true }).fill("Juniper");
  await page.getByLabel("Selected cat").selectOption({ label: "Miso" }); await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Miso");
});
test("feeding requires confirmed labels and leaves invalid controls editable", async ({ page }) => {
  await navigate(page,"Profile"); await page.getByRole("checkbox", { name: "I checked this cat’s age", exact: false }).check();
  await navigate(page,"Feeding"); await expect(page.getByRole("heading", { name: "Real labels. Not example portions." })).toBeVisible();
  await page.getByRole("checkbox", { name: "I checked the food energy", exact: false }).check(); await expect(page.locator(".calorie-number")).toBeVisible();
  await page.getByLabel("Dry food energy (kcal/kg)", { exact: true }).fill("0"); await expect(page.getByRole("alert")).toContainText("dry food energy"); await expect(page.locator(".calorie-number")).toHaveCount(0);
  await page.getByLabel("Dry food energy (kcal/kg)", { exact: true }).fill("3800"); await page.getByRole("checkbox", { name: "I checked the food energy", exact: false }).check(); await expect(page.locator(".calorie-number")).toBeVisible();
  await page.getByLabel("Meals per day", { exact: true }).fill("2.5"); await expect(page.getByRole("alert")).toContainText("whole meals");
  await page.getByLabel("Meals per day", { exact: true }).fill("2"); await expect(page.locator(".calorie-number")).toBeVisible();
});
test("a health condition requires the vet calorie target", async ({ page }) => {
  await navigate(page,"Profile"); await page.getByRole("checkbox", { name: "I checked this cat’s age", exact: false }).check(); await page.getByLabel("Known health conditions").fill("Kidney disease"); await navigate(page,"Feeding");
  await page.getByRole("checkbox", { name: "I checked the food energy", exact: false }).check(); await expect(page.getByRole("alert")).toContainText("set by your vet");
  await page.getByLabel("Daily calories set by your vet", { exact: false }).fill("250"); await expect(page.locator(".calorie-number")).toContainText("250");
  await page.getByLabel("Treats (kcal/day)", { exact: true }).fill("30"); await expect(page.getByRole("alert")).toContainText("10%");
});
test("reminders persist and export a calendar with an alarm", async ({ page }) => {
  await navigate(page,"Reminders"); await page.getByLabel("Task", { exact: true }).fill("Weekly weigh-in"); await page.getByLabel("Date & time", { exact: true }).fill("2026-10-20T08:30"); await page.getByLabel("Repeat", { exact: false }).selectOption("weekly"); await page.getByRole("button", { name: "Add reminder", exact: true }).click();
  await expect(page.locator(".reminder-row")).toContainText("Weekly weigh-in");
  const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Export all to calendar" }).click(); const download = await event; const stream = await download.createReadStream();
  let cal = ""; if (stream) for await (const chunk of stream) cal += chunk.toString();
  expect(cal).toContain("BEGIN:VALARM"); expect(cal).toContain("RRULE:FREQ=WEEKLY");
  await page.reload(); await navigate(page,"Reminders"); await expect(page.locator(".reminder-row")).toContainText("Weekly weigh-in");
});
test("weight records update the chart and profile", async ({ page }) => {
  await navigate(page,"Care journal"); await page.getByLabel("Weight (kg)", { exact: true }).fill("4.3"); await page.getByLabel("Notes (optional)", { exact: true }).fill("Normal appetite"); await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(page.getByRole("img", { name: /Recorded weight/ })).toBeVisible(); await expect(page.locator(".journal-row")).toContainText("4.3 kg");
  await navigate(page,"Profile"); await expect(page.getByLabel("Current weight (kg)", { exact: true })).toHaveValue("4.3");
});
test("guides are searchable and source claims have exact links", async ({ page }) => {
  await navigate(page,"Care library"); await page.getByRole("searchbox", { name: "Search care guides" }).fill("brushing teeth"); await page.getByRole("button", { name: /Start brushing teeth gently/ }).click();
  await expect(page.locator(".opened-guide")).toContainText("inflamed");
  await page.locator(".opened-guide").getByText("Cornell Feline Health Center", { exact: true }).click(); await expect(page.locator(".opened-guide a").first()).toHaveAttribute("href", /vet\.cornell\.edu/);
  await navigate(page,"Sources"); await page.getByRole("searchbox", { name: "Search sources" }).fill("Box 1"); await expect(page.locator(".source-card")).toHaveCount(1); await expect(page.locator(".source-card a")).toHaveAttribute("href", /nutritiongl_box1\.pdf$/);
});
test("a password-protected phone transfer restores the selected profile", async ({ page }) => {
  await navigate(page,"Profile"); await page.getByLabel("Name", { exact: true }).fill("Phone cat"); await navigate(page,"Phone & backup");
  await page.getByLabel("Trusted Cat Compass HTTPS address", { exact: true }).fill("https://example.com/cat-compass/");
  await page.getByLabel("Transfer password (at least 12 characters)", { exact: false }).fill("private-transfer-test-123");
  await page.getByRole("button", { name: "Create private transfer", exact: true }).click();
  await expect(page.getByAltText("QR code for an encrypted Cat Compass transfer")).toBeVisible();
  const link = await page.getByLabel("Private transfer link", { exact: false }).inputValue(); expect(link).not.toContain("Phone cat");
  const token = new URL(link).hash;
  await navigate(page,"Profile"); await page.getByLabel("Name", { exact: true }).fill("Changed phone cat");
  await page.goto("/" + token); await expect(page.getByRole("heading", { name: "Open a private transfer" })).toBeVisible();
  await page.getByLabel("Transfer password", { exact: true }).fill("private-transfer-test-123"); page.once("dialog", d => d.accept()); await page.getByRole("button", { name: "Open transfer", exact: true }).click();
  await navigate(page,"Profile"); await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Phone cat");
});
test("backup export imports only after confirmation", async ({ page }) => {
  await navigate(page,"Profile"); await page.getByLabel("Name", { exact: true }).fill("Backup cat"); await navigate(page,"Phone & backup");
  const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Export full backup", exact: true }).click(); const file = await event; const stream = await file.createReadStream(); let raw = ""; if (stream) for await (const chunk of stream) raw += chunk.toString();
  expect(JSON.parse(raw).cats[0].name).toBe("Backup cat"); await navigate(page,"Profile"); await page.getByLabel("Name", { exact: true }).fill("Changed"); await navigate(page,"Phone & backup");
  page.once("dialog", dialog => dialog.accept()); await page.locator('input[type="file"]').setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(raw) });
  await navigate(page,"Profile"); await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Backup cat");
});
test("emergency advice does not tell owners to wait for breathing to settle", async ({ page }) => {
  await page.getByText("Know when it cannot wait", { exact: true }).click(); await expect(page.locator(".redflags")).toContainText("Do not wait to see if it settles.");
  await expect(page.locator(".redflags")).toContainText("Do not wait for symptoms.");
});
test("care sheet never prints invalid or unconfirmed portions", async ({ page }) => {
  await navigate(page,"Care sheet"); await expect(page.locator(".fridge")).toContainText("No feeding amounts");
  await page.emulateMedia({ media: "print" }); await expect(page.locator(".sidebar")).not.toBeVisible(); await expect(page.locator(".fridge")).toBeVisible();
});
test("a removed cat stays removed after reload", async ({ page }) => {
  await navigate(page,"Profile"); await page.getByLabel("Name", { exact: true }).fill("Keeper");
  await page.getByRole("button", { name: "Add a cat", exact: true }).click(); await page.getByLabel("Name", { exact: true }).fill("Leaving");
  page.once("dialog", d => d.accept()); await page.getByRole("button", { name: "Remove this cat and their records", exact: true }).click();
  await expect(page.getByLabel("Selected cat").locator("option")).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel("Selected cat").locator("option")).toHaveText(["Keeper"]);
});
