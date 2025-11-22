import {
  ECSClient,
  ListClustersCommand,
  DescribeClustersCommand,
  ListServicesCommand,
  DescribeServicesCommand,
  ListTasksCommand,
  DescribeTasksCommand
} from '@aws-sdk/client-ecs'
import { fromIni } from '@aws-sdk/credential-providers'
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader'

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

export async function listClusters(): Promise<Cluster[]> {
  try {
    // Load AWS config to get default region
    const { configFile } = await loadSharedConfigFiles()
    const defaultRegion = configFile?.default?.region || 'us-east-1'

    // Create ECS client with credentials from ~/.aws/credentials
    const client = new ECSClient({
      region: defaultRegion,
      credentials: fromIni()
    })

    // List cluster ARNs
    const listCommand = new ListClustersCommand({})
    const listResponse = await client.send(listCommand)

    if (!listResponse.clusterArns || listResponse.clusterArns.length === 0) {
      return []
    }

    // Get detailed cluster information
    const describeCommand = new DescribeClustersCommand({
      clusters: listResponse.clusterArns,
      include: ['STATISTICS']
    })
    const describeResponse = await client.send(describeCommand)

    // Map to simplified cluster objects
    const clusters: Cluster[] =
      describeResponse.clusters?.map((cluster) => ({
        name: cluster.clusterName || 'Unknown',
        arn: cluster.clusterArn || '',
        status: cluster.status || 'UNKNOWN',
        registeredContainerInstancesCount: cluster.registeredContainerInstancesCount || 0,
        runningTasksCount: cluster.runningTasksCount || 0,
        pendingTasksCount: cluster.pendingTasksCount || 0,
        activeServicesCount: cluster.activeServicesCount || 0
      })) || []

    return clusters
  } catch (error) {
    console.error('Error listing ECS clusters:', error)
    throw error
  }
}

export async function listServices(clusterArn: string): Promise<Service[]> {
  try {
    // Load AWS config to get default region
    const { configFile } = await loadSharedConfigFiles()
    const defaultRegion = configFile?.default?.region || 'us-east-1'

    // Create ECS client
    const client = new ECSClient({
      region: defaultRegion,
      credentials: fromIni()
    })

    // List service ARNs
    const listCommand = new ListServicesCommand({
      cluster: clusterArn
    })
    const listResponse = await client.send(listCommand)

    if (!listResponse.serviceArns || listResponse.serviceArns.length === 0) {
      return []
    }

    // Get detailed service information
    const describeCommand = new DescribeServicesCommand({
      cluster: clusterArn,
      services: listResponse.serviceArns
    })
    const describeResponse = await client.send(describeCommand)

    // Map to simplified service objects
    const services: Service[] =
      describeResponse.services?.map((service) => ({
        name: service.serviceName || 'Unknown',
        arn: service.serviceArn || '',
        status: service.status || 'UNKNOWN',
        desiredCount: service.desiredCount || 0,
        runningCount: service.runningCount || 0,
        pendingCount: service.pendingCount || 0,
        launchType: service.launchType || 'UNKNOWN',
        taskDefinition: service.taskDefinition || ''
      })) || []

    return services
  } catch (error) {
    console.error('Error listing ECS services:', error)
    throw error
  }
}

export async function listTasks(clusterArn: string, serviceName: string): Promise<Task[]> {
  try {
    // Load AWS config to get default region
    const { configFile } = await loadSharedConfigFiles()
    const defaultRegion = configFile?.default?.region || 'us-east-1'

    // Create ECS client
    const client = new ECSClient({
      region: defaultRegion,
      credentials: fromIni()
    })

    // List task ARNs for the service
    const listCommand = new ListTasksCommand({
      cluster: clusterArn,
      serviceName: serviceName
    })
    const listResponse = await client.send(listCommand)

    if (!listResponse.taskArns || listResponse.taskArns.length === 0) {
      return []
    }

    // Get detailed task information
    const describeCommand = new DescribeTasksCommand({
      cluster: clusterArn,
      tasks: listResponse.taskArns
    })
    const describeResponse = await client.send(describeCommand)

    // Map to simplified task objects
    const tasks: Task[] =
      describeResponse.tasks?.map((task) => ({
        taskArn: task.taskArn || '',
        taskDefinitionArn: task.taskDefinitionArn || '',
        clusterArn: task.clusterArn || '',
        lastStatus: task.lastStatus || 'UNKNOWN',
        desiredStatus: task.desiredStatus || 'UNKNOWN',
        cpu: task.cpu || '0',
        memory: task.memory || '0',
        createdAt: task.createdAt?.toISOString() || '',
        startedAt: task.startedAt?.toISOString() || '',
        containers:
          task.containers?.map((container) => ({
            name: container.name || 'Unknown',
            lastStatus: container.lastStatus || 'UNKNOWN'
          })) || []
      })) || []

    return tasks
  } catch (error) {
    console.error('Error listing ECS tasks:', error)
    throw error
  }
}

export async function getTaskContainers(clusterArn: string, taskArn: string): Promise<Container[]> {
  try {
    // Load AWS config to get default region
    const { configFile } = await loadSharedConfigFiles()
    const defaultRegion = configFile?.default?.region || 'us-east-1'

    // Create ECS client
    const client = new ECSClient({
      region: defaultRegion,
      credentials: fromIni()
    })

    // Get detailed task information
    const describeCommand = new DescribeTasksCommand({
      cluster: clusterArn,
      tasks: [taskArn]
    })
    const describeResponse = await client.send(describeCommand)

    if (!describeResponse.tasks || describeResponse.tasks.length === 0) {
      return []
    }

    const task = describeResponse.tasks[0]

    // Map to detailed container objects
    const containers: Container[] =
      task.containers?.map((container) => ({
        name: container.name || 'Unknown',
        containerArn: container.containerArn || '',
        taskArn: task.taskArn || '',
        lastStatus: container.lastStatus || 'UNKNOWN',
        exitCode: container.exitCode,
        reason: container.reason,
        image: container.image || '',
        imageDigest: container.imageDigest || '',
        runtimeId: container.runtimeId || '',
        cpu: container.cpu || '0',
        memory: container.memory || '0',
        memoryReservation: container.memoryReservation || '0',
        networkBindings:
          container.networkBindings?.map((binding) => ({
            bindIP: binding.bindIP || '',
            containerPort: binding.containerPort || 0,
            hostPort: binding.hostPort || 0,
            protocol: binding.protocol || ''
          })) || [],
        networkInterfaces:
          container.networkInterfaces?.map((iface) => ({
            privateIpv4Address: iface.privateIpv4Address || ''
          })) || [],
        healthStatus: container.healthStatus
      })) || []

    return containers
  } catch (error) {
    console.error('Error getting task containers:', error)
    throw error
  }
}
