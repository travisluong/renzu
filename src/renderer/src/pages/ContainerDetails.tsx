import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/ContainerDetails.module.css'

interface ContainerDetails {
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
  healthStatus?: string
  networkBindings: Array<{
    bindIP: string
    containerPort: number
    hostPort: number
    protocol: string
  }>
  networkInterfaces: Array<{
    privateIpv4Address: string
  }>
}

function ContainerDetails(): React.JSX.Element {
  const navigate = useNavigate()
  const { clusterName, serviceName, taskArn, containerName } = useParams<{
    clusterName: string
    serviceName: string
    taskArn: string
    containerName: string
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
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`
    },
    {
      label: containerName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(containerName || '')}/details`
    }
  ]

  const {
    data: containers = [],
    isLoading,
    error
  } = useQuery<ContainerDetails[]>({
    queryKey: ['containers', clusterName, taskArn],
    queryFn: () => window.api.ecs.getTaskContainers(clusterName!, taskArn!),
    enabled: !!clusterName && !!taskArn
  })

  const container = containers.find((c) => c.name === containerName)

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Container Details</h1>
        <p className={styles.loading}>Loading container details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Container Details</h1>
        <p className={styles.error}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch container details'}
        </p>
      </div>
    )
  }

  if (!container) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Container Details</h1>
        <p className={styles.empty}>Container not found.</p>
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
        <h1 className={styles.header}>{container.name}</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            onClick={() =>
              navigate(
                `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(containerName || '')}/logs`
              )
            }
          >
            View Logs
          </button>
          <button
            className={styles.actionButton}
            onClick={() => {
              const region = taskArn?.split(':')[3]
              const cluster = taskArn?.split(':')[5].split('/')[1]
              const taskId = taskArn?.split('/').pop()
              const url = `https://console.aws.amazon.com/ecs/v2/clusters/${cluster}/tasks/${taskId}?region=${region}`
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
            <span className={styles.detailLabel}>Container Name:</span>
            <span className={styles.detailValue}>{container.name}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Status:</span>
            <span className={getStatusClass(container.lastStatus)}>{container.lastStatus}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Health Status:</span>
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
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Container ARN:</span>
            <span className={styles.detailValue}>{container.containerArn}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Task ARN:</span>
            <span className={styles.detailValue}>{container.taskArn}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Runtime ID:</span>
            <span className={styles.detailValue}>{container.runtimeId}</span>
          </div>
          {container.exitCode !== undefined && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Exit Code:</span>
              <span className={styles.detailValue}>{container.exitCode}</span>
            </div>
          )}
          {container.reason && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Reason:</span>
              <span className={styles.detailValue}>{container.reason}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Image</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Image:</span>
            <span className={styles.detailValueMono}>{container.image}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Image Digest:</span>
            <span className={styles.detailValueMono}>{container.imageDigest}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Resources</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>CPU:</span>
            <span className={styles.detailValue}>{container.cpu}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Memory:</span>
            <span className={styles.detailValue}>{container.memory}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Memory Reservation:</span>
            <span className={styles.detailValue}>{container.memoryReservation}</span>
          </div>
        </div>
      </div>

      {container.networkInterfaces && container.networkInterfaces.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Network Interfaces</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Private IPv4 Address</th>
              </tr>
            </thead>
            <tbody>
              {container.networkInterfaces.map((iface, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={styles.ipAddress}>{iface.privateIpv4Address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {container.networkBindings && container.networkBindings.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Network Bindings</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Container Port</th>
                <th>Host Port</th>
                <th>Protocol</th>
                <th>Bind IP</th>
              </tr>
            </thead>
            <tbody>
              {container.networkBindings.map((binding, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td>{binding.containerPort}</td>
                  <td>{binding.hostPort}</td>
                  <td>{binding.protocol}</td>
                  <td className={styles.ipAddress}>{binding.bindIP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ContainerDetails
