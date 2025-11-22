import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  ecs: {
    listClusters: () => ipcRenderer.invoke('ecs:listClusters'),
    listServices: (clusterArn: string) => ipcRenderer.invoke('ecs:listServices', clusterArn),
    listTasks: (clusterArn: string, serviceName: string) =>
      ipcRenderer.invoke('ecs:listTasks', clusterArn, serviceName)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
