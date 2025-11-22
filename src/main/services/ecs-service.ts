import {
  ECSClient,
  ListClustersCommand,
  DescribeClustersCommand,
  ListServicesCommand,
  DescribeServicesCommand
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
