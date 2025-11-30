import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/Tasks.module.css'

interface Task {
  taskArn: string
  taskDefinitionArn: string
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

function Tasks(): React.JSX.Element {
  const navigate = useNavigate()
  const { clusterName, serviceName } = useParams<{ clusterName: string; serviceName: string }>()

  const breadcrumbItems = [
    { label: 'Clusters', path: '/clusters' },
    {
      label: clusterName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services`
    },
    {
      label: serviceName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`
    }
  ]

  const {
    data: tasks = [],
    isLoading,
    error
  } = useQuery<Task[]>({
    queryKey: ['tasks', clusterName, serviceName],
    queryFn: () => window.api.ecs.listTasks(clusterName!, serviceName!),
    enabled: !!clusterName && !!serviceName
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Tasks</h1>
          <p className={styles.loading}>Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Tasks</h1>
          <p className={styles.error}>
            Error: {error instanceof Error ? error.message : 'Failed to fetch tasks'}
          </p>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Tasks - {serviceName}</h1>
          <p className={styles.empty}>No tasks found for this service.</p>
        </div>
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
      <div className={styles.content}>
        <h1 className={styles.header}>Tasks - {serviceName}</h1>
        <p className={styles.description}>
          Found {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>Task ID</th>
              <th>Last Status</th>
              <th>Desired Status</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Created</th>
              <th>Started</th>
              <th>Containers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.taskArn} className={styles.tableRow}>
                <td className={styles.taskId}>
                  <button
                    className={styles.nameLink}
                    onClick={() =>
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(task.taskArn)}/details`
                      )
                    }
                  >
                    {task.taskArn.split('/').pop()}
                  </button>
                </td>
                <td>
                  <span className={getStatusClass(task.lastStatus)}>{task.lastStatus}</span>
                </td>
                <td>
                  <span className={getStatusClass(task.desiredStatus)}>{task.desiredStatus}</span>
                </td>
                <td className={styles.cpuCell}>{task.cpu}</td>
                <td className={styles.memoryCell}>{task.memory}</td>
                <td className={styles.dateCell}>
                  {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
                </td>
                <td className={styles.dateCell}>
                  {task.startedAt ? new Date(task.startedAt).toLocaleString() : 'Unknown'}
                </td>
                <td className={styles.containersCell}>
                  {task.containers.map((container, idx) => (
                    <div key={idx} className={styles.containerItem}>
                      {container.name}: {container.lastStatus}
                    </div>
                  ))}
                </td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.actionButton}
                    onClick={() =>
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(task.taskArn)}/details`
                      )
                    }
                  >
                    View Details
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() =>
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(task.taskArn)}/containers`,
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Tasks
