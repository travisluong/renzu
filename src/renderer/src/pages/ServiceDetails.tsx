import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/ServiceDetails.module.css'

interface ServiceDetails {
  arn: string
  name: string
  status: string
  desiredCount: number
  runningCount: number
  pendingCount: number
  launchType: string
  taskDefinition: string
  clusterArn: string
  roleArn?: string
  createdAt?: string
  deploymentConfiguration?: {
    maximumPercent: number
    minimumHealthyPercent: number
    deploymentCircuitBreaker?: {
      enable: boolean
      rollback: boolean
    }
  }
  loadBalancers?: Array<{
    targetGroupArn?: string
    containerName?: string
    containerPort?: number
  }>
  networkConfiguration?: {
    awsvpcConfiguration?: {
      subnets: string[]
      securityGroups: string[]
      assignPublicIp?: string
    }
  }
  placementStrategy?: Array<{
    type: string
    field?: string
  }>
  placementConstraints?: Array<{
    type: string
    expression?: string
  }>
  capacityProviderStrategy?: Array<{
    capacityProvider: string
    weight: number
    base: number
  }>
  tags?: Array<{
    key: string
    value: string
  }>
  events?: Array<{
    id: string
    createdAt: string
    message: string
  }>
}

function ServiceDetails(): React.JSX.Element {
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
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/details`
    }
  ]

  const {
    data: service,
    isLoading,
    error
  } = useQuery<ServiceDetails>({
    queryKey: ['serviceDetails', clusterName, serviceName],
    queryFn: () => window.api.ecs.getServiceDetails(clusterName!, serviceName!),
    enabled: !!clusterName && !!serviceName
  })

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Service Details</h1>
        <p className={styles.loading}>Loading service details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Service Details</h1>
        <p className={styles.error}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch service details'}
        </p>
      </div>
    )
  }

  if (!service) {
    return (
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.header}>Service Details</h1>
        <p className={styles.empty}>Service not found.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={styles.headerSection}>
        <h1 className={styles.header}>{service.name}</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            onClick={() =>
              navigate(
                `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`
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
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>ARN:</span>
            <span className={styles.detailValue}>{service.arn}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Status:</span>
            <span
              className={service.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}
            >
              {service.status}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Cluster:</span>
            <span className={styles.detailValue}>{service.clusterArn.split('/').pop()}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Launch Type:</span>
            <span className={styles.detailValue}>{service.launchType}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Desired Count:</span>
            <span className={`${styles.detailValue} ${styles.desiredCount}`}>
              {service.desiredCount}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Running Count:</span>
            <span className={`${styles.detailValue} ${styles.runningCount}`}>
              {service.runningCount}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Pending Count:</span>
            <span className={`${styles.detailValue} ${styles.pendingCount}`}>
              {service.pendingCount}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Task Definition:</span>
            <span className={styles.detailValue}>{service.taskDefinition.split('/').pop()}</span>
          </div>
          {service.createdAt && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Created At:</span>
              <span className={styles.detailValue}>
                {new Date(service.createdAt).toLocaleString()}
              </span>
            </div>
          )}
          {service.roleArn && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Role ARN:</span>
              <span className={styles.detailValue}>{service.roleArn.split('/').pop()}</span>
            </div>
          )}
        </div>
      </div>

      {service.deploymentConfiguration && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Deployment Configuration</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Maximum Percent:</span>
              <span className={styles.detailValue}>
                {service.deploymentConfiguration.maximumPercent}%
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Minimum Healthy Percent:</span>
              <span className={styles.detailValue}>
                {service.deploymentConfiguration.minimumHealthyPercent}%
              </span>
            </div>
            {service.deploymentConfiguration.deploymentCircuitBreaker && (
              <>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Circuit Breaker:</span>
                  <span className={styles.detailValue}>
                    {service.deploymentConfiguration.deploymentCircuitBreaker.enable
                      ? 'Enabled'
                      : 'Disabled'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Auto Rollback:</span>
                  <span className={styles.detailValue}>
                    {service.deploymentConfiguration.deploymentCircuitBreaker.rollback
                      ? 'Enabled'
                      : 'Disabled'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {service.loadBalancers && service.loadBalancers.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Load Balancers</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Target Group ARN</th>
                <th>Container Name</th>
                <th>Container Port</th>
              </tr>
            </thead>
            <tbody>
              {service.loadBalancers.map((lb, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={styles.arnCell}>{lb.targetGroupArn || 'N/A'}</td>
                  <td>{lb.containerName || 'N/A'}</td>
                  <td>{lb.containerPort || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {service.networkConfiguration?.awsvpcConfiguration && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Network Configuration</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Subnets:</span>
              <div className={styles.listItems}>
                {service.networkConfiguration.awsvpcConfiguration.subnets.map((subnet, idx) => (
                  <div key={idx} className={styles.listItem}>
                    {subnet}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Security Groups:</span>
              <div className={styles.listItems}>
                {service.networkConfiguration.awsvpcConfiguration.securityGroups.map((sg, idx) => (
                  <div key={idx} className={styles.listItem}>
                    {sg}
                  </div>
                ))}
              </div>
            </div>
            {service.networkConfiguration.awsvpcConfiguration.assignPublicIp && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Assign Public IP:</span>
                <span className={styles.detailValue}>
                  {service.networkConfiguration.awsvpcConfiguration.assignPublicIp}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {service.capacityProviderStrategy && service.capacityProviderStrategy.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Capacity Provider Strategy</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Capacity Provider</th>
                <th>Weight</th>
                <th>Base</th>
              </tr>
            </thead>
            <tbody>
              {service.capacityProviderStrategy.map((strategy, idx) => (
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

      {service.placementStrategy && service.placementStrategy.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Placement Strategy</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Type</th>
                <th>Field</th>
              </tr>
            </thead>
            <tbody>
              {service.placementStrategy.map((strategy, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td>{strategy.type}</td>
                  <td>{strategy.field || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {service.placementConstraints && service.placementConstraints.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Placement Constraints</h2>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Type</th>
                <th>Expression</th>
              </tr>
            </thead>
            <tbody>
              {service.placementConstraints.map((constraint, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td>{constraint.type}</td>
                  <td>{constraint.expression || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {service.tags && service.tags.length > 0 && (
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
              {service.tags.map((tag, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={styles.tagKey}>{tag.key}</td>
                  <td>{tag.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {service.events && service.events.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Events</h2>
          <div className={styles.eventsContainer}>
            {service.events.slice(0, 10).map((event) => (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.eventTime}>{new Date(event.createdAt).toLocaleString()}</div>
                <div className={styles.eventMessage}>{event.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceDetails
