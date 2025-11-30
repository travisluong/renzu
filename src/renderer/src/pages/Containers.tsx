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
        <div className={styles.content}>
          <h1 className={styles.header}>Containers</h1>
          <p className={styles.loading}>Loading containers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Containers</h1>
          <p className={styles.error}>
            Error: {error instanceof Error ? error.message : 'Failed to fetch containers'}
          </p>
        </div>
      </div>
    )
  }

  if (containers.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Containers - {taskArn?.split('/').pop()}</h1>
          <p className={styles.empty}>No containers found for this task.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={styles.content}>
        <h1 className={styles.header}>Containers - {taskArn?.split('/').pop()}</h1>
        <p className={styles.description}>
          Found {containers.length} container{containers.length !== 1 ? 's' : ''}
        </p>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Health</th>
              <th>Image</th>
              <th>Runtime ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {containers.map((container) => (
              <tr key={container.containerArn} className={styles.tableRow}>
                <td className={styles.containerNameCell}>
                  <button
                    className={styles.nameLink}
                    onClick={() =>
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(container.name)}/details`
                      )
                    }
                  >
                    {container.name}
                  </button>
                </td>
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
                <td className={styles.imageCell} title={container.image}>
                  {container.image}
                </td>
                <td className={styles.runtimeId}>{container.runtimeId.substring(0, 12)}</td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(container.name)}/details`
                      )
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(container.name)}/logs`
                      )
                    }}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Containers
