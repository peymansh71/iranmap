const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("app-version"),

  // Add other APIs as needed for your app
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  // File operations (if needed)
  saveFile: (data) => ipcRenderer.invoke("save-file", data),
  openFile: () => ipcRenderer.invoke("open-file"),

  // App controls
  minimize: () => ipcRenderer.invoke("minimize-window"),
  maximize: () => ipcRenderer.invoke("maximize-window"),
  close: () => ipcRenderer.invoke("close-window"),

  // Listen to events from main process
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", callback),
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on("update-downloaded", callback),
});

// Expose platform information
contextBridge.exposeInMainWorld("platform", {
  name: process.platform,
  isDesktop: true,
});
