import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'

function Containers(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const taskDefinitionArn = (location.state as { taskDefinitionArn?: string })?.taskDefinitionArn
  const { clusterName, serviceName, taskArn } = useParams<{
    clusterName: string
    serviceName: string
    taskArn: string
  }>()

  // Store taskDefinitionArn in sessionStorage when available
  if (taskDefinitionArn && taskArn) {
    sessionStorage.setItem(`taskDef:${taskArn}`, taskDefinitionArn)
  }

  const {
    data: containers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['containers', clusterName, taskArn],
    queryFn: () => window.api.ecs.getTaskContainers(clusterName!, taskArn!),
    enabled: !!clusterName && !!taskArn
  })

  if (isLoading) {
    return (
      <div>
        <Link
          to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`}
        >
          ← Back to Tasks
        </Link>
        <h1>Containers</h1>
        <p>Loading containers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Link
          to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`}
        >
          ← Back to Tasks
        </Link>
        <h1>Containers</h1>
        <p style={{ color: 'red' }}>
          Error: {error instanceof Error ? error.message : 'Failed to fetch containers'}
        </p>
      </div>
    )
  }

  if (containers.length === 0) {
    return (
      <div>
        <Link
          to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`}
        >
          ← Back to Tasks
        </Link>
        <h1>Containers - {taskArn?.split('/').pop()}</h1>
        <p>No containers found for this task.</p>
      </div>
    )
  }

  return (
    <div>
      <Link
        to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`}
      >
        ← Back to Tasks
      </Link>
      <h1>Containers - {taskArn?.split('/').pop()}</h1>
      <p>
        Found {containers.length} container{containers.length !== 1 ? 's' : ''}
      </p>
      <div style={{ marginTop: '20px' }}>
        {containers.map((container) => (
          <div
            key={container.containerArn}
            onClick={() => {
              navigate(
                `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(container.name)}/logs`
              )
            }}
            style={{
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: '#1a1a1a',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
          >
            <h2 style={{ marginTop: 0 }}>{container.name}</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div>
                <strong>Status:</strong> {container.lastStatus}
              </div>
              <div>
                <strong>Health:</strong> {container.healthStatus || 'N/A'}
              </div>
              <div>
                <strong>CPU:</strong> {container.cpu}
              </div>
              <div>
                <strong>Memory:</strong> {container.memory}
              </div>
              <div>
                <strong>Memory Reservation:</strong> {container.memoryReservation}
              </div>
              <div>
                <strong>Runtime ID:</strong>{' '}
                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {container.runtimeId.substring(0, 12)}
                </span>
              </div>
            </div>

            {container.exitCode !== undefined && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Exit Code:</strong> {container.exitCode}
                {container.reason && (
                  <span style={{ marginLeft: '10px', color: '#ff6b6b' }}>
                    Reason: {container.reason}
                  </span>
                )}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <strong>Image:</strong>
              <div
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  marginTop: '4px',
                  wordBreak: 'break-all'
                }}
              >
                {container.image}
              </div>
              {container.imageDigest && (
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#888',
                    marginTop: '2px'
                  }}
                >
                  {container.imageDigest}
                </div>
              )}
            </div>

            {container.networkInterfaces.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Network Interfaces:</strong>
                {container.networkInterfaces.map((iface, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      marginTop: '4px'
                    }}
                  >
                    Private IP: {iface.privateIpv4Address}
                  </div>
                ))}
              </div>
            )}

            {container.networkBindings.length > 0 && (
              <div>
                <strong>Network Bindings:</strong>
                <table
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px'
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid #444' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Container Port</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Host Port</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Protocol</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Bind IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {container.networkBindings.map((binding, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '8px' }}>{binding.containerPort}</td>
                        <td style={{ padding: '8px' }}>{binding.hostPort}</td>
                        <td style={{ padding: '8px' }}>{binding.protocol}</td>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                          {binding.bindIP}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Containers
