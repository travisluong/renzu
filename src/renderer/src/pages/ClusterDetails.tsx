import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/ClusterDetails.module.css'

interface ClusterDetails {
  arn: string
  name: string
  status: string
  registeredContainerInstancesCount: number
  runningTasksCount: number
  pendingTasksCount: number
  activeServicesCount: number
  statistics?: Array<{
    name: string
    value: string
  }>
  tags?: Array<{
    key: string
    value: string
  }>
  settings?: Array<{
    name: string
    value: string
  }>
  capacityProviders?: string[]
  defaultCapacityProviderStrategy?: Array<{
    capacityProvider: string
    weight: number
    base: number
  }>
}

function ClusterDetails(): React.JSX.Element {
  const navigate = useNavigate()
  const { clusterName } = useParams<{ clusterName: string }>()

  const breadcrumbItems = [
    { label: 'Clusters', path: '/clusters' },
    {
      label: clusterName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/details`
    }
  ]

  const {
    data: cluster,
    isLoading,
    error
  } = useQuery<ClusterDetails>({
    queryKey: ['clusterDetails', clusterName],
    queryFn: () => window.api.ecs.getClusterDetails(clusterName!),
    enabled: !!clusterName
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Cluster Details</h1>
          <p className={styles.loading}>Loading cluster details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Cluster Details</h1>
          <p className={styles.error}>
            Error: {error instanceof Error ? error.message : 'Failed to fetch cluster details'}
          </p>
        </div>
      </div>
    )
  }

  if (!cluster) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1 className={styles.header}>Cluster Details</h1>
          <p className={styles.empty}>Cluster not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={styles.content}>
        <div className={styles.headerSection}>
          <h1 className={styles.header}>{cluster.name}</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.actionButton}
              onClick={() =>
                navigate(`/clusters/${encodeURIComponent(clusterName || '')}/services`)
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
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>ARN:</span>
              <span className={styles.detailValue}>{cluster.arn}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Status:</span>
              <span
                className={
                  cluster.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                }
              >
                {cluster.status}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Container Instances:</span>
              <span className={styles.detailValue}>
                {cluster.registeredContainerInstancesCount}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Running Tasks:</span>
              <span className={`${styles.detailValue} ${styles.runningCount}`}>
                {cluster.runningTasksCount}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Pending Tasks:</span>
              <span className={`${styles.detailValue} ${styles.pendingCount}`}>
                {cluster.pendingTasksCount}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Active Services:</span>
              <span className={`${styles.detailValue} ${styles.activeServices}`}>
                {cluster.activeServicesCount}
              </span>
            </div>
          </div>
        </div>

        {cluster.capacityProviders && cluster.capacityProviders.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Capacity Providers</h2>
            <div className={styles.listItems}>
              {cluster.capacityProviders.map((provider, idx) => (
                <div key={idx} className={styles.listItem}>
                  {provider}
                </div>
              ))}
            </div>
          </div>
        )}

        {cluster.defaultCapacityProviderStrategy &&
          cluster.defaultCapacityProviderStrategy.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Default Capacity Provider Strategy</h2>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th>Capacity Provider</th>
                    <th>Weight</th>
                    <th>Base</th>
                  </tr>
                </thead>
                <tbody>
                  {cluster.defaultCapacityProviderStrategy.map((strategy, idx) => (
                    <tr key={idx} className={styles.tableRow}>
                      <td>{strategy.capacityProvider}</td>
                      <td>{strategy.weight}</td>
                      <td>{strategy.base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {cluster.settings && cluster.settings.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Settings</h2>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {cluster.settings.map((setting, idx) => (
                  <tr key={idx} className={styles.tableRow}>
                    <td className={styles.settingName}>{setting.name}</td>
                    <td>{setting.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cluster.tags && cluster.tags.length > 0 && (
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
                {cluster.tags.map((tag, idx) => (
                  <tr key={idx} className={styles.tableRow}>
                    <td className={styles.tagKey}>{tag.key}</td>
                    <td>{tag.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cluster.statistics && cluster.statistics.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Statistics</h2>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {cluster.statistics.map((stat, idx) => (
                  <tr key={idx} className={styles.tableRow}>
                    <td>{stat.name}</td>
                    <td>{stat.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClusterDetails
