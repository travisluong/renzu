import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/Containers.module.css'

interface Container {
  containerArn: string
  name: string
  lastStatus: string
  healthStatus?: string
  cpu: string
  memory: string
  memoryReservation: string
  runtimeId: string
  exitCode?: number
  reason?: string
  image: string
  imageDigest?: string
  networkInterfaces: Array<{
    privateIpv4Address: string
  }>
  networkBindings: Array<{
    containerPort: number
    hostPort: number
    protocol: string
    bindIP: string
  }>
}

function Containers(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const taskDefinitionArn = (location.state as { taskDefinitionArn?: string })?.taskDefinitionArn
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
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`
    }
  ]

  // Store taskDefinitionArn in sessionStorage when available
  if (taskDefinitionArn && taskArn) {
    sessionStorage.setItem(`taskDef:${taskArn}`, taskDefinitionArn)
  }

  const {
    data: containers = [],
    isLoading,
    error
  } = useQuery<Container[]>({
    queryKey: ['containers', clusterName, taskArn],
    queryFn: () => window.api.ecs.getTaskContainers(clusterName!, taskArn!),
    enabled: !!clusterName && !!taskArn
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Containers</h1>
        <p className={styles.loading}>Loading containers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Containers</h1>
        <p className={styles.error}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch containers'}
        </p>
      </div>
    )
  }

  if (containers.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Containers - {taskArn?.split('/').pop()}</h1>
        <p className={styles.empty}>No containers found for this task.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className={styles.header}>Containers - {taskArn?.split('/').pop()}</h1>
      <p className={styles.description}>
        Found {containers.length} container{containers.length !== 1 ? 's' : ''}
      </p>
      <div className={styles.containersList}>
        {containers.map((container) => (
          <div
            key={container.containerArn}
            className={styles.containerCard}
            onClick={() => {
              navigate(
                `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(container.name)}/logs`
              )
            }}
          >
            <h2 className={styles.containerName}>{container.name}</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span
                  className={`${styles.infoValue} ${container.lastStatus === 'RUNNING' ? styles.statusRunning : styles.statusStopped}`}
                >
                  {container.lastStatus}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Health:</span>
                <span
                  className={`${styles.infoValue} ${container.healthStatus === 'HEALTHY' ? styles.healthHealthy : container.healthStatus === 'UNHEALTHY' ? styles.healthUnhealthy : ''}`}
                >
                  {container.healthStatus || 'N/A'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>CPU:</span>
                <span className={styles.infoValue}>{container.cpu}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Memory:</span>
                <span className={styles.infoValue}>{container.memory}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Memory Reservation:</span>
                <span className={styles.infoValue}>{container.memoryReservation}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Runtime ID:</span>
                <span className={`${styles.infoValue} ${styles.runtimeId}`}>
                  {container.runtimeId.substring(0, 12)}
                </span>
              </div>
            </div>

            {container.exitCode !== undefined && (
              <div className={styles.exitCodeSection}>
                <span className={styles.infoLabel}>Exit Code:</span> {container.exitCode}
                {container.reason && (
                  <span className={styles.exitReason}>Reason: {container.reason}</span>
                )}
              </div>
            )}

            <div className={styles.imageSection}>
              <div className={styles.infoLabel}>Image:</div>
              <div className={styles.imagePath}>{container.image}</div>
              {container.imageDigest && (
                <div className={styles.imageDigest}>{container.imageDigest}</div>
              )}
            </div>

            {container.networkInterfaces.length > 0 && (
              <div className={styles.networkSection}>
                <div className={styles.sectionTitle}>Network Interfaces:</div>
                {container.networkInterfaces.map((iface, idx) => (
                  <div key={idx} className={styles.networkInterface}>
                    Private IP: {iface.privateIpv4Address}
                  </div>
                ))}
              </div>
            )}

            {container.networkBindings.length > 0 && (
              <div className={styles.networkSection}>
                <div className={styles.sectionTitle}>Network Bindings:</div>
                <table className={styles.bindingsTable}>
                  <thead>
                    <tr>
                      <th>Container Port</th>
                      <th>Host Port</th>
                      <th>Protocol</th>
                      <th>Bind IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {container.networkBindings.map((binding, idx) => (
                      <tr key={idx}>
                        <td>{binding.containerPort}</td>
                        <td>{binding.hostPort}</td>
                        <td>{binding.protocol}</td>
                        <td className="bindIP">{binding.bindIP}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Containers
