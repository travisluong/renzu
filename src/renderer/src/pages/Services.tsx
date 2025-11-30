import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/Services.module.css'

function Services(): React.JSX.Element {
  const navigate = useNavigate()
  const { clusterName } = useParams<{ clusterName: string }>()

  const breadcrumbItems = [
    { label: 'Clusters', path: '/clusters' },
    {
      label: clusterName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services`
    }
  ]

  const {
    data: services = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['services', clusterName],
    queryFn: () => window.api.ecs.listServices(clusterName!),
    enabled: !!clusterName
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1>Services</h1>
          <p>Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1>Services</h1>
          <p style={{ color: 'red' }}>
            Error: {error instanceof Error ? error.message : 'Failed to fetch services'}
          </p>
        </div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <div className={styles.content}>
          <h1>Services</h1>
          <p>No services found in this cluster.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={styles.content}>
        <h1 className={styles.header}>Services</h1>
        <p className={styles.description}>
          Found {services.length} service{services.length !== 1 ? 's' : ''}
        </p>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Name</th>
              <th className={styles.tableHeader}>Status</th>
              <th className={styles.tableHeaderRight}>Desired</th>
              <th className={styles.tableHeaderRight}>Running</th>
              <th className={styles.tableHeaderRight}>Pending</th>
              <th className={styles.tableHeader}>Launch Type</th>
              <th className={styles.tableHeader}>Task Definition</th>
              <th className={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.arn} className={styles.tableRow}>
                <td className={styles.tableCellName}>
                  <button
                    className={styles.nameLink}
                    onClick={() =>
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(service.name)}/details`
                      )
                    }
                  >
                    {service.name}
                  </button>
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={
                      service.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                    }
                  >
                    {service.status}
                  </span>
                </td>
                <td className={`${styles.tableCellRightBold} ${styles.desiredCount}`}>
                  {service.desiredCount}
                </td>
                <td className={`${styles.tableCellRightBold} ${styles.runningCount}`}>
                  {service.runningCount}
                </td>
                <td className={`${styles.tableCellRightBold} ${styles.pendingCount}`}>
                  {service.pendingCount}
                </td>
                <td className={styles.tableCell}>{service.launchType}</td>
                <td className={styles.taskDefinition}>{service.taskDefinition.split('/').pop()}</td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.actionButton}
                    onClick={() =>
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(service.name)}/details`
                      )
                    }
                  >
                    View Details
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() =>
                      navigate(
                        `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(service.name)}/tasks`
                      )
                    }
                  >
                    View Tasks
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      const region = service.arn.split(':')[3]
                      const clusterName = service.arn.split(':')[5].split('/')[1]
                      const serviceName = service.arn.split('/')[2]
                      const url = `https://console.aws.amazon.com/ecs/v2/clusters/${clusterName}/services/${serviceName}?region=${region}`
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

export default Services
