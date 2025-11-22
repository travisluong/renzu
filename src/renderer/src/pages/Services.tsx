import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { Service } from '../../../preload/index.d'

function Services(): React.JSX.Element {
  const navigate = useNavigate()
  const { clusterName } = useParams<{ clusterName: string }>()

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
        <Link to="/clusters">← Back to Clusters</Link>
        <h1>Services</h1>
        <p>Loading services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Link to="/clusters">← Back to Clusters</Link>
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
        <Link to="/clusters">← Back to Clusters</Link>
        <h1>Services</h1>
        <p>No services found in this cluster.</p>
      </div>
    )
  }

  return (
    <div>
      <Link to="/clusters">← Back to Clusters</Link>
      <h1>Services</h1>
      <p>
        Found {services.length} service{services.length !== 1 ? 's' : ''}
      </p>
      <table
        style={{
          marginTop: '20px',
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#1a1a1a'
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #444' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Desired</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Running</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Pending</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Launch Type</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Task Definition</th>
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
              style={{
                borderBottom: '1px solid #333',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '12px' }}>{service.name}</td>
              <td style={{ padding: '12px' }}>{service.status}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{service.desiredCount}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{service.runningCount}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{service.pendingCount}</td>
              <td style={{ padding: '12px' }}>{service.launchType}</td>
              <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>
                {service.taskDefinition.split('/').pop()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Services
