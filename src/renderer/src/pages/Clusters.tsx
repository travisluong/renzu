import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/Clusters.module.css'

function Clusters(): React.JSX.Element {
  const navigate = useNavigate()

  const {
    data: clusters = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['clusters'],
    queryFn: () => window.api.ecs.listClusters()
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={[{ label: 'Clusters', path: '/clusters' }]} />
        <div className={styles.content}>
          <h1>ECS Clusters</h1>
          <p>Loading clusters...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={[{ label: 'Clusters', path: '/clusters' }]} />
        <div className={styles.content}>
          <h1>ECS Clusters</h1>
          <p style={{ color: 'red' }}>
            Error: {error instanceof Error ? error.message : 'Failed to fetch clusters'}
          </p>
          <p>Make sure AWS CLI is configured. Run: aws configure</p>
        </div>
      </div>
    )
  }

  if (clusters.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={[{ label: 'Clusters', path: '/clusters' }]} />
        <div className={styles.content}>
          <h1>ECS Clusters</h1>
          <p>No clusters found in your AWS account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs items={[{ label: 'Clusters', path: '/clusters' }]} />
      <div className={styles.content}>
        <h1 className={styles.header}>ECS Clusters</h1>
        <p className={styles.description}>
          Found {clusters.length} cluster{clusters.length !== 1 ? 's' : ''}
        </p>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Name</th>
              <th className={styles.tableHeader}>Status</th>
              <th className={styles.tableHeaderRight}>Container Instances</th>
              <th className={styles.tableHeaderRight}>Running Tasks</th>
              <th className={styles.tableHeaderRight}>Pending Tasks</th>
              <th className={styles.tableHeaderRight}>Active Services</th>
              <th className={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((cluster) => (
              <tr key={cluster.arn} className={styles.tableRow}>
                <td className={styles.tableCellName}>{cluster.name}</td>
                <td className={styles.tableCell}>
                  <span
                    className={
                      cluster.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                    }
                  >
                    {cluster.status}
                  </span>
                </td>
                <td className={styles.tableCellRight}>
                  {cluster.registeredContainerInstancesCount}
                </td>
                <td className={`${styles.tableCellRightBold} ${styles.runningTasks}`}>
                  {cluster.runningTasksCount}
                </td>
                <td className={`${styles.tableCellRightBold} ${styles.pendingTasks}`}>
                  {cluster.pendingTasksCount}
                </td>
                <td className={`${styles.tableCellRightBold} ${styles.activeServices}`}>
                  {cluster.activeServicesCount}
                </td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.actionButton}
                    onClick={() => navigate(`/clusters/${encodeURIComponent(cluster.arn)}/details`)}
                  >
                    View Details
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() =>
                      navigate(`/clusters/${encodeURIComponent(cluster.arn)}/services`)
                    }
                  >
                    View Services
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      const region = cluster.arn.split(':')[3]
                      const clusterName = cluster.arn.split('/')[1]
                      const url = `https://console.aws.amazon.com/ecs/v2/clusters/${clusterName}?region=${region}`
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

export default Clusters
