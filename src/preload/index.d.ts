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

export interface Service {
  name: string
  arn: string
  status: string
  desiredCount: number
  runningCount: number
  pendingCount: number
  launchType: string
  taskDefinition: string
}

export interface ECSAPI {
  listClusters: () => Promise<Cluster[]>
  listServices: (clusterArn: string) => Promise<Service[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ecs: ECSAPI
    }
  }
}
