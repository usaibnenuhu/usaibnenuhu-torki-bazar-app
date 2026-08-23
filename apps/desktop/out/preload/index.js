"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  invoke: (channel, payload) => electron.ipcRenderer.invoke(channel, payload)
});
