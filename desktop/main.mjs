import { app, BrowserWindow, ipcMain, Menu, nativeImage, Notification, shell, Tray } from "electron";
import { readFile, writeFile, rename } from "node:fs/promises";
import { join, dirname, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validReminders } from "./reminder-validation.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dev = process.argv.includes("--dev");
const target = dev ? "http://localhost:5195/" : pathToFileURL(join(root, "dist/index.html")).href;
const testData = process.argv.find(arg => arg.startsWith("--test-data-dir="))?.slice(16);
if (testData && isAbsolute(testData)) app.setPath("userData", testData);
let window, tray, quitting = false, reminders = [], notified = {}, writes = Promise.resolve();
const scheduleFile = () => join(app.getPath("userData"), "reminder-schedule.json");
function saveSchedule() {
  const data = JSON.stringify({ reminders, notified });
  writes = writes.catch(() => {}).then(async () => { await writeFile(scheduleFile() + ".tmp", data, { mode: 0o600 }); await rename(scheduleFile() + ".tmp", scheduleFile()); });
  return writes;
}
function openExternal(url) {
  try { const u = new URL(url); if (u.protocol === "https:" && !u.username && !u.password) void shell.openExternal(u.href); } catch { /* Do not launch unknown schemes. */ }
}
function show() { window?.show(); window?.focus(); }
function createWindow() {
  window = new BrowserWindow({ width: 1380, height: 950, minWidth: 720, minHeight: 600, title: "Cat Compass", backgroundColor: "#f7f6f2", icon: join(root, "public/icon-512.png"), webPreferences: { preload: join(root, "desktop/preload.cjs"), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
  window.webContents.setWindowOpenHandler(({ url }) => { openExternal(url); return { action: "deny" }; });
  window.webContents.on("will-navigate", (event, url) => { if (url.split("#")[0] !== target) { event.preventDefault(); openExternal(url); } });
  window.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => callback(permission === "notifications"));
  window.webContents.session.setPermissionCheckHandler((_webContents, permission) => permission === "notifications");
  window.on("close", event => { if (!quitting) { event.preventDefault(); window.hide(); } });
  void window.loadURL(target);
}
function checkDue() {
  if (!Notification.isSupported()) return;
  let changed = false;
  for (const r of reminders) {
    if (!r.enabled || Date.parse(r.due) > Date.now() || notified[r.id] === r.due) continue;
    new Notification({ title: `${r.catName || "Cat"}: ${r.title}`, body: "Open Cat Compass to complete this care task.", silent: false }).show();
    notified[r.id] = r.due; changed = true;
  }
  if (changed) void saveSchedule().catch(() => console.error("Could not save reminder delivery state."));
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", show);
  app.on("before-quit", () => { quitting = true; });
  app.on("activate", show);
  app.whenReady().then(async () => {
    try {
      const data = JSON.parse(await readFile(scheduleFile(), "utf8"));
      if (validReminders(data.reminders)) reminders = data.reminders;
      if (data.notified && typeof data.notified === "object" && !Array.isArray(data.notified)) notified = Object.fromEntries(Object.entries(data.notified).filter(([id, due]) => typeof due === "string" && reminders.some(r => r.id === id)));
    } catch { /* First start or invalid file: renderer will supply validated records. */ }
    ipcMain.handle("care:set-reminders", async (event, value) => {
      if (event.sender !== window?.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url.split("#")[0] !== target || !validReminders(value)) return false;
      reminders = value; notified = Object.fromEntries(Object.entries(notified).filter(([id]) => reminders.some(r => r.id === id)));
      try { await saveSchedule(); checkDue(); return true; } catch { return false; }
    });
    createWindow();
    const image = nativeImage.createFromPath(join(root, "public/icon-192.png")).resize({ width: 22, height: 22 });
    tray = new Tray(image); tray.setToolTip("Cat Compass");
    tray.setContextMenu(Menu.buildFromTemplate([{ label: "Open Cat Compass", click: show }, { type: "separator" }, { label: "Quit Cat Compass", click: () => app.quit() }])); tray.on("click", show);
    Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: "Cat Compass", submenu: [{ label: "Open Cat Compass", click: show }, { role: "quit" }] }, { role: "editMenu" }, { role: "viewMenu" }, { role: "windowMenu" }]));
    checkDue(); setInterval(checkDue, 30000).unref();
  });
}
