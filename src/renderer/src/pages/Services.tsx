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
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <h1>Services</h1>
        <p>Loading services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <h1>Services</h1>
        <p style={{ color: 'red' }}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch services'}
        </p>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <h1>Services</h1>
        <p>No services found in this cluster.</p>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
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
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr
              key={service.arn}
              onClick={() =>
                navigate(
                  `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(service.name)}/tasks`
                )
              }
              className={styles.tableRow}
            >
              <td className={styles.tableCellName}>{service.name}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Services
