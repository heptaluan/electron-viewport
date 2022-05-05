"use strict";
var electron = require("electron");
var os = require("os");
var path = require("path");
if (os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let win = null;
async function createWindow() {
  win = new electron.BrowserWindow({
    width: 1024,
    height: 768,
    titleBarStyle: "hidden",
    darkTheme: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (electron.app.isPackaged) {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
    win.webContents.openDevTools();
  } else {
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;
    win.loadURL(url);
    win.webContents.openDevTools();
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", new Date().toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:"))
      electron.shell.openExternal(url);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
electron.ipcMain.on("min", function(event) {
  const win2 = electron.BrowserWindow.fromWebContents(event.sender);
  win2.minimize();
});
electron.ipcMain.on("max", function(event) {
  const win2 = electron.BrowserWindow.fromWebContents(event.sender);
  if (win2.isMaximized()) {
    win2.unmaximize();
  } else {
    win2.maximize();
  }
});
electron.ipcMain.on("close", function(event) {
  const win2 = electron.BrowserWindow.fromWebContents(event.sender);
  win2.close();
});
//# sourceMappingURL=index.cjs.map
