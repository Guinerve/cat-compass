import { _electron as electron, expect } from "@playwright/test";
import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
const base = tmpdir();
const data = await mkdtemp(join(base, "cat-compass-desktop-"));
const executablePath = process.env.CAT_COMPASS_EXECUTABLE;
const launch = executablePath ? { executablePath, args: [`--test-data-dir=${data}`] } : { args: [resolve("."), `--test-data-dir=${data}`] };
const app = await electron.launch(launch);
try {
  const page = await app.firstWindow();
  await expect(page.getByRole("heading", { name: "Life is better with My cat." })).toBeVisible();
  const boundary = await page.evaluate(() => ({ node: typeof window.require, process: typeof window.process, bridge: Object.keys(window.catCompassDesktop || {}) }));
  if (boundary.node !== "undefined" || boundary.process !== "undefined" || boundary.bridge.join(",") !== "platform,setReminders") throw new Error("Unexpected renderer authority.");
  await page.getByRole("navigation").getByRole("button", { name: "Reminders", exact: true }).click();
  await page.getByLabel("Task", { exact: true }).fill("Desktop smoke test");
  await page.getByLabel("Date & time", { exact: true }).fill("2030-10-20T08:30");
  await page.getByRole("button", { name: "Add reminder", exact: true }).click();
  await expect.poll(async () => JSON.parse(await readFile(join(data, "reminder-schedule.json"), "utf8")).reminders.length).toBe(1);
  const reminders = JSON.parse(await readFile(join(data, "reminder-schedule.json"), "utf8"));
  if (reminders.reminders[0].title !== "Desktop smoke test") throw new Error("Native reminder schedule differs from UI.");
  const screenshots = process.env.CAT_COMPASS_SCREENSHOT_DIR || "test-results/desktop";
  await mkdir(screenshots, { recursive: true });
  await page.screenshot({ path: join(screenshots, "reminders.png") });
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
  if (await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible())) throw new Error("Window should hide, not quit.");
  console.log(JSON.stringify({ status: "passed", target: executablePath || "development Electron", data, checks: ["offline UI", "sandboxed renderer", "narrow IPC bridge", "persisted native schedule", "close-to-tray"] }, null, 2));
} finally { await app.close(); }
