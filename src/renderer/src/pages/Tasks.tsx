import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import type { Task } from '../../../preload/index.d'

function Tasks(): React.JSX.Element {
  const { clusterName, serviceName } = useParams<{ clusterName: string; serviceName: string }>()

  const {
    data: tasks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks', clusterName, serviceName],
    queryFn: () => window.api.ecs.listTasks(clusterName!, serviceName!),
    enabled: !!clusterName && !!serviceName
  })

  if (isLoading) {
    return (
      <div>
        <Link to={`/clusters/${encodeURIComponent(clusterName || '')}/services`}>
          ← Back to Services
        </Link>
        <h1>Tasks</h1>
        <p>Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Link to={`/clusters/${encodeURIComponent(clusterName || '')}/services`}>
          ← Back to Services
        </Link>
        <h1>Tasks</h1>
        <p style={{ color: 'red' }}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch tasks'}
        </p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div>
        <Link to={`/clusters/${encodeURIComponent(clusterName || '')}/services`}>
          ← Back to Services
        </Link>
        <h1>Tasks - {serviceName}</h1>
        <p>No tasks found for this service.</p>
      </div>
    )
  }

  return (
    <div>
      <Link to={`/clusters/${encodeURIComponent(clusterName || '')}/services`}>
        ← Back to Services
      </Link>
      <h1>Tasks - {serviceName}</h1>
      <p>
        Found {tasks.length} task{tasks.length !== 1 ? 's' : ''}
      </p>
      <div style={{ marginTop: '20px' }}>
        {tasks.map((task) => (
          <div
            key={task.taskArn}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0' }}>{task.taskArn.split('/').pop()}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div>Last Status: {task.lastStatus}</div>
              <div>Desired Status: {task.desiredStatus}</div>
              <div>CPU: {task.cpu}</div>
              <div>Memory: {task.memory}</div>
              <div>
                Created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
              </div>
              <div>
                Started: {task.startedAt ? new Date(task.startedAt).toLocaleString() : 'Unknown'}
              </div>
            </div>
            {task.containers.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <strong>Containers:</strong>
                <div style={{ marginTop: '8px' }}>
                  {task.containers.map((container, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginBottom: '4px'
                      }}
                    >
                      {container.name} - {container.lastStatus}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tasks
