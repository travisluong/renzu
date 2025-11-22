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

export interface Task {
  taskArn: string
  taskDefinitionArn: string
  clusterArn: string
  lastStatus: string
  desiredStatus: string
  cpu: string
  memory: string
  createdAt: string
  startedAt: string
  containers: Array<{
    name: string
    lastStatus: string
  }>
}

export interface Container {
  name: string
  containerArn: string
  taskArn: string
  lastStatus: string
  exitCode?: number
  reason?: string
  image: string
  imageDigest: string
  runtimeId: string
  cpu: string
  memory: string
  memoryReservation: string
  networkBindings: Array<{
    bindIP: string
    containerPort: number
    hostPort: number
    protocol: string
  }>
  networkInterfaces: Array<{
    privateIpv4Address: string
  }>
  healthStatus?: string
}

export interface ECSAPI {
  listClusters: () => Promise<Cluster[]>
  listServices: (clusterArn: string) => Promise<Service[]>
  listTasks: (clusterArn: string, serviceName: string) => Promise<Task[]>
  getTaskContainers: (clusterArn: string, taskArn: string) => Promise<Container[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ecs: ECSAPI
    }
  }
}
