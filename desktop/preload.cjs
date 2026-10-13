const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("catCompassDesktop", Object.freeze({
  platform: process.platform,
  setReminders: (reminders) => ipcRenderer.invoke("care:set-reminders", reminders),
}));
