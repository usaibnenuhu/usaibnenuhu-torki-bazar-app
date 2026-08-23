import { contextBridge, ipcRenderer } from "electron";

// Minimal, explicit surface exposed to the renderer — no direct Node or
// Electron API access, only a single typed invoke bridge (section 55).
contextBridge.exposeInMainWorld("api", {
  invoke: (channel: string, payload?: unknown) => ipcRenderer.invoke(channel, payload),
});
