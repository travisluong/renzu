import {
  CloudWatchLogsClient,
  GetLogEventsCommand,
  GetLogEventsCommandOutput
} from '@aws-sdk/client-cloudwatch-logs'
import { ECSClient, DescribeTaskDefinitionCommand, LogConfiguration } from '@aws-sdk/client-ecs'
import { fromIni } from '@aws-sdk/credential-providers'
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader'

export interface LogEvent {
  timestamp: number
  message: string
  ingestionTime: number
}

export interface LogConfigurationResult {
  logGroupName: string
  logStreamPrefix: string
  region: string
}

export interface LogsResponse {
  events: LogEvent[]
  nextForwardToken?: string
  nextBackwardToken?: string
}

/**
 * Get log configuration from ECS task definition
 */
export async function getLogConfiguration(
  taskDefinitionArn: string,
  containerName: string
): Promise<LogConfigurationResult> {
  try {
    // Load AWS config to get default region
    const { configFile } = await loadSharedConfigFiles()
    const defaultRegion = configFile?.default?.region || 'us-east-1'

    // Create ECS client
    const client = new ECSClient({
      region: defaultRegion,
      credentials: fromIni()
    })

    // Get task definition details
    const command = new DescribeTaskDefinitionCommand({
      taskDefinition: taskDefinitionArn
    })
    const response = await client.send(command)

    if (!response.taskDefinition?.containerDefinitions) {
      throw new Error('No container definitions found in task definition')
    }

    // Find the specific container
    const container = response.taskDefinition.containerDefinitions.find(
      (c) => c.name === containerName
    )

    if (!container) {
      throw new Error(`Container ${containerName} not found in task definition`)
    }

    // Extract log configuration
    const logConfig = container.logConfiguration as LogConfiguration | undefined

    if (!logConfig || logConfig.logDriver !== 'awslogs') {
      throw new Error(
        `Container ${containerName} does not use awslogs driver or has no log configuration`
      )
    }

    const options = logConfig.options || {}
    const logGroupName = options['awslogs-group']
    const logStreamPrefix = options['awslogs-stream-prefix']
    const region = options['awslogs-region'] || defaultRegion

    if (!logGroupName || !logStreamPrefix) {
      throw new Error('Missing required awslogs configuration (group or stream-prefix)')
    }

    return {
      logGroupName,
      logStreamPrefix,
      region
    }
  } catch (error) {
    console.error('Error getting log configuration:', error)
    throw error
  }
}

/**
 * Get container logs from CloudWatch Logs
 */
export async function getContainerLogs(
  logGroupName: string,
  logStreamName: string,
  region: string,
  nextToken?: string,
  startFromHead?: boolean
): Promise<LogsResponse> {
  try {
    // Create CloudWatch Logs client
    const client = new CloudWatchLogsClient({
      region: region,
      credentials: fromIni()
    })

    // Get log events
    const command = new GetLogEventsCommand({
      logGroupName,
      logStreamName,
      startFromHead: startFromHead ?? !nextToken, // If no token, start from head
      nextToken,
      limit: 1000 // Fetch up to 1000 events per request
    })

    const response: GetLogEventsCommandOutput = await client.send(command)

    const events: LogEvent[] =
      response.events?.map((event) => ({
        timestamp: event.timestamp || 0,
        message: event.message || '',
        ingestionTime: event.ingestionTime || 0
      })) || []

    return {
      events,
      nextForwardToken: response.nextForwardToken,
      nextBackwardToken: response.nextBackwardToken
    }
  } catch (error) {
    console.error('Error getting container logs:', error)
    throw error
  }
}
