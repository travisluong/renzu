import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'

function Tasks(): React.JSX.Element {
  const navigate = useNavigate()
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
            <th style={{ padding: '12px', textAlign: 'left' }}>Task ID</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Last Status</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Desired Status</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>CPU</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Memory</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Started</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Containers</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.taskArn}
              onClick={() =>
                navigate(
                  `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(task.taskArn)}/containers`,
                  { state: { taskDefinitionArn: task.taskDefinitionArn } }
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
              <td style={{ padding: '12px' }}>{task.taskArn.split('/').pop()}</td>
              <td style={{ padding: '12px' }}>{task.lastStatus}</td>
              <td style={{ padding: '12px' }}>{task.desiredStatus}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{task.cpu}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{task.memory}</td>
              <td style={{ padding: '12px', fontSize: '12px' }}>
                {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
              </td>
              <td style={{ padding: '12px', fontSize: '12px' }}>
                {task.startedAt ? new Date(task.startedAt).toLocaleString() : 'Unknown'}
              </td>
              <td style={{ padding: '12px' }}>
                {task.containers.map((container, idx) => (
                  <div key={idx} style={{ fontSize: '12px', marginBottom: '4px' }}>
                    {container.name}: {container.lastStatus}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Tasks
