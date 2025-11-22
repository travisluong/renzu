import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

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
      <div>
        <h1>ECS Clusters</h1>
        <p>Loading clusters...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1>ECS Clusters</h1>
        <p style={{ color: 'red' }}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch clusters'}
        </p>
        <p>Make sure AWS CLI is configured. Run: aws configure</p>
      </div>
    )
  }

  if (clusters.length === 0) {
    return (
      <div>
        <h1>ECS Clusters</h1>
        <p>No clusters found in your AWS account.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>ECS Clusters</h1>
      <p>
        Found {clusters.length} cluster{clusters.length !== 1 ? 's' : ''}
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
            <th style={{ padding: '12px', textAlign: 'right' }}>Container Instances</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Running Tasks</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Pending Tasks</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Active Services</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((cluster) => (
            <tr
              key={cluster.arn}
              onClick={() => navigate(`/clusters/${encodeURIComponent(cluster.arn)}/services`)}
              style={{
                borderBottom: '1px solid #333',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '12px' }}>{cluster.name}</td>
              <td style={{ padding: '12px' }}>{cluster.status}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                {cluster.registeredContainerInstancesCount}
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{cluster.runningTasksCount}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{cluster.pendingTasksCount}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{cluster.activeServicesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Clusters
