import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { Service } from '../../../preload/index.d'

function Services(): React.JSX.Element {
  const navigate = useNavigate()
  const { clusterName } = useParams<{ clusterName: string }>()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      if (!clusterName) return

      try {
        setLoading(true)
        setError(null)
        // clusterName is the ARN passed from Clusters page
        const data = await window.api.ecs.listServices(clusterName)
        setServices(data)
      } catch (err) {
        console.error('Error fetching services:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch services')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [clusterName])

  if (loading) {
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
        <p style={{ color: 'red' }}>Error: {error}</p>
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
      <div style={{ marginTop: '20px' }}>
        {services.map((service) => (
          <div
            key={service.arn}
            onClick={() =>
              navigate(
                `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(service.name)}/tasks`
              )
            }
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <h2>{service.name}</h2>
            <p>Status: {service.status}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div>Desired: {service.desiredCount}</div>
              <div>Running: {service.runningCount}</div>
              <div>Pending: {service.pendingCount}</div>
              <div>Launch Type: {service.launchType}</div>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Task Definition: {service.taskDefinition.split('/').pop()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Services
