import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/TaskDetails.module.css'

interface TaskDetails {
  taskArn: string
  taskDefinitionArn: string
  clusterArn: string
  lastStatus: string
  desiredStatus: string
  cpu: string
  memory: string
  createdAt: string
  startedAt?: string
  stoppedAt?: string
  stoppedReason?: string
  stopCode?: string
  connectivity?: string
  connectivityAt?: string
  pullStartedAt?: string
  pullStoppedAt?: string
  executionStoppedAt?: string
  launchType: string
  platformVersion?: string
  platformFamily?: string
  availabilityZone?: string
  group?: string
  containers: Array<{
    containerArn: string
    name: string
    lastStatus: string
    exitCode?: number
    reason?: string
    image: string
    runtimeId: string
    healthStatus?: string
    networkBindings: Array<{
      bindIP: string
      containerPort: number
      hostPort: number
      protocol: string
    }>
    networkInterfaces: Array<{
      privateIpv4Address: string
      attachmentId: string
    }>
  }>
  attachments?: Array<{
    id: string
    type: string
    status: string
    details: Array<{
      name: string
      value: string
    }>
  }>
  tags?: Array<{
    key: string
    value: string
  }>
}

function TaskDetails(): React.JSX.Element {
  const navigate = useNavigate()
  const { clusterName, serviceName, taskArn } = useParams<{
    clusterName: string
    serviceName: string
    taskArn: string
  }>()

  const taskId = taskArn?.split('/').pop() || ''

  const breadcrumbItems = [
    { label: 'Clusters', path: '/clusters' },
    {
      label: clusterName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services`
    },
    {
      label: serviceName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`
    },
    {
      label: `Task ${taskId}`,
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/details`
    }
  ]

  const {
    data: task,
    isLoading,
    error
  } = useQuery<TaskDetails>({
    queryKey: ['taskDetails', clusterName, taskArn],
    queryFn: () => window.api.ecs.getTaskDetails(clusterName!, taskArn!),
    enabled: !!clusterName && !!taskArn
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Task Details</h1>
        <p className={styles.loading}>Loading task details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Task Details</h1>
        <p className={styles.error}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch task details'}
        </p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Task Details</h1>
        <p className={styles.empty}>Task not found.</p>
      </div>
    )
  }

  const getStatusClass = (status: string): string => {
    if (status === 'RUNNING') return styles.statusRunning
    if (status === 'PENDING' || status === 'PROVISIONING') return styles.statusPending
    return styles.statusStopped
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={styles.headerSection}>
        <h1 className={styles.header}>Task {taskId}</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            onClick={() =>
              navigate(
                `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`,
                { state: { taskDefinitionArn: task.taskDefinitionArn } }
              )
            }
          >
            View Containers
          </button>
          <button
            className={styles.actionButton}
            onClick={() => {
              const region = task.taskArn.split(':')[3]
              const clusterName = task.taskArn.split(':')[5].split('/')[1]
              const taskId = task.taskArn.split('/').pop()
              const url = `https://console.aws.amazon.com/ecs/v2/clusters/${clusterName}/tasks/${taskId}?region=${region}`
              window.open(url, '_blank')
            }}
          >
            Open in AWS
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Task ARN:</span>
            <span className={styles.detailValue}>{task.taskArn}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Last Status:</span>
            <span className={getStatusClass(task.lastStatus)}>{task.lastStatus}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Desired Status:</span>
            <span className={getStatusClass(task.desiredStatus)}>{task.desiredStatus}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Launch Type:</span>
            <span className={styles.detailValue}>{task.launchType}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Task Definition:</span>
            <span className={styles.detailValue}>{task.taskDefinitionArn.split('/').pop()}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Cluster:</span>
            <span className={styles.detailValue}>{task.clusterArn.split('/').pop()}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>CPU:</span>
            <span className={styles.detailValue}>{task.cpu}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Memory:</span>
            <span className={styles.detailValue}>{task.memory}</span>
          </div>
          {task.platformVersion && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Platform Version:</span>
              <span className={styles.detailValue}>{task.platformVersion}</span>
            </div>
          )}
          {task.platformFamily && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Platform Family:</span>
              <span className={styles.detailValue}>{task.platformFamily}</span>
            </div>
          )}
          {task.availabilityZone && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Availability Zone:</span>
              <span className={styles.detailValue}>{task.availabilityZone}</span>
            </div>
          )}
          {task.group && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Group:</span>
              <span className={styles.detailValue}>{task.group}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Timeline</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Created At:</span>
            <span className={styles.detailValue}>
              {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
            </span>
          </div>
          {task.startedAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Started At:</span>
              <span className={styles.detailValue}>
                {new Date(task.startedAt).toLocaleString()}
              </span>
            </div>
          )}
          {task.stoppedAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Stopped At:</span>
              <span className={styles.detailValue}>
                {new Date(task.stoppedAt).toLocaleString()}
              </span>
            </div>
          )}
          {task.pullStartedAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Pull Started At:</span>
              <span className={styles.detailValue}>
                {new Date(task.pullStartedAt).toLocaleString()}
              </span>
            </div>
          )}
          {task.pullStoppedAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Pull Stopped At:</span>
              <span className={styles.detailValue}>
                {new Date(task.pullStoppedAt).toLocaleString()}
              </span>
            </div>
          )}
          {task.executionStoppedAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Execution Stopped At:</span>
              <span className={styles.detailValue}>
                {new Date(task.executionStoppedAt).toLocaleString()}
              </span>
            </div>
          )}
          {task.connectivityAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Connectivity At:</span>
              <span className={styles.detailValue}>
                {new Date(task.connectivityAt).toLocaleString()}
              </span>
            </div>
          )}
          {task.connectivity && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Connectivity:</span>
              <span className={styles.detailValue}>{task.connectivity}</span>
            </div>
          )}
        </div>
      </div>

      {(task.stoppedReason || task.stopCode) && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Stop Information</h2>
          <div className={styles.detailsGrid}>
            {task.stopCode && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Stop Code:</span>
                <span className={styles.detailValue}>{task.stopCode}</span>
              </div>
            )}
            {task.stoppedReason && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Stopped Reason:</span>
                <span className={styles.detailValue}>{task.stoppedReason}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Containers</h2>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Health</th>
              <th>Image</th>
              <th>Runtime ID</th>
            </tr>
          </thead>
          <tbody>
            {task.containers.map((container) => (
              <tr key={container.containerArn} className={styles.tableRow}>
                <td className={styles.containerName}>{container.name}</td>
                <td>
                  <span
                    className={
                      container.lastStatus === 'RUNNING'
                        ? styles.statusRunning
                        : styles.statusStopped
                    }
                  >
                    {container.lastStatus}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      container.healthStatus === 'HEALTHY'
                        ? styles.healthHealthy
                        : container.healthStatus === 'UNHEALTHY'
                          ? styles.healthUnhealthy
                          : styles.healthNA
                    }
                  >
                    {container.healthStatus || 'N/A'}
                  </span>
                </td>
                <td className={styles.imageCell}>{container.image}</td>
                <td className={styles.runtimeId}>{container.runtimeId.substring(0, 12)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {task.attachments && task.attachments.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Attachments</h2>
          {task.attachments.map((attachment) => (
            <div key={attachment.id} className={styles.attachmentCard}>
              <div className={styles.attachmentHeader}>
                <span className={styles.attachmentType}>{attachment.type}</span>
                <span className={styles.attachmentStatus}>{attachment.status}</span>
              </div>
              <div className={styles.attachmentDetails}>
                {attachment.details.map((detail, detailIdx) => (
                  <div key={detailIdx} className={styles.detailRow}>
                    <span className={styles.detailName}>{detail.name}:</span>
                    <span className={styles.detailContent}>{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tags</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {task.tags.map((tag, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={styles.tagKey}>{tag.key}</td>
                  <td>{tag.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TaskDetails
