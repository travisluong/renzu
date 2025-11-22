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
      <div style={{ marginTop: '20px' }}>
        {clusters.map((cluster) => (
          <div
            key={cluster.arn}
            onClick={() => navigate(`/clusters/${encodeURIComponent(cluster.arn)}/services`)}
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
            <h2>{cluster.name}</h2>
            <p>Status: {cluster.status}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div>Container Instances: {cluster.registeredContainerInstancesCount}</div>
              <div>Running Tasks: {cluster.runningTasksCount}</div>
              <div>Pending Tasks: {cluster.pendingTasksCount}</div>
              <div>Active Services: {cluster.activeServicesCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Clusters
