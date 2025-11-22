import { ECSClient, ListClustersCommand, DescribeClustersCommand } from '@aws-sdk/client-ecs'
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
