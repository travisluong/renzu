import { ElectronAPI } from '@electron-toolkit/preload'

export interface Cluster {
  name: string
  arn: string
  status: string
  registeredContainerInstancesCount: number
  runningTasksCount: number
  pendingTasksCount: number
  activeServicesCount: number
}

export interface ECSAPI {
  listClusters: () => Promise<Cluster[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ecs: ECSAPI
    }
  }
}
