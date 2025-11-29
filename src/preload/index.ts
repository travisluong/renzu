import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  ecs: {
    listClusters: () => ipcRenderer.invoke('ecs:listClusters'),
    getClusterDetails: (clusterArn: string) =>
      ipcRenderer.invoke('ecs:getClusterDetails', clusterArn),
    listServices: (clusterArn: string) => ipcRenderer.invoke('ecs:listServices', clusterArn),
    getServiceDetails: (clusterArn: string, serviceName: string) =>
      ipcRenderer.invoke('ecs:getServiceDetails', clusterArn, serviceName),
    listTasks: (clusterArn: string, serviceName: string) =>
      ipcRenderer.invoke('ecs:listTasks', clusterArn, serviceName),
    getTaskContainers: (clusterArn: string, taskArn: string) =>
      ipcRenderer.invoke('ecs:getTaskContainers', clusterArn, taskArn)
  },
  logs: {
    getLogConfiguration: (taskDefinitionArn: string, containerName: string) =>
      ipcRenderer.invoke('logs:getLogConfiguration', taskDefinitionArn, containerName),
    getContainerLogs: (
      logGroupName: string,
      logStreamName: string,
      region: string,
      nextToken?: string,
      startFromHead?: boolean
    ) =>
      ipcRenderer.invoke(
        'logs:getContainerLogs',
        logGroupName,
        logStreamName,
        region,
        nextToken,
        startFromHead
      )
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
