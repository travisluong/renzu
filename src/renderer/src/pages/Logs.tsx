import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'

interface LogEntry {
  timestamp: number
  message: string
  ingestionTime: number
}

function Logs(): React.JSX.Element {
  const { clusterName, serviceName, taskArn, containerName } = useParams<{
    clusterName: string
    serviceName: string
    taskArn: string
    containerName: string
  }>()

  const [allLogs, setAllLogs] = useState<LogEntry[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [isTailing, setIsTailing] = useState(false)
  const nextTokenRef = useRef<string | undefined>(undefined)
  const logStreamNameRef = useRef<string | undefined>(undefined)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  // Retrieve taskDefinitionArn from sessionStorage
  const taskDefinitionArn = taskArn ? sessionStorage.getItem(`taskDef:${taskArn}`) : null

  const {
    data: logConfig,
    isLoading: isLoadingConfig,
    error: configError
  } = useQuery({
    queryKey: ['logConfig', taskDefinitionArn, containerName],
    queryFn: async () => {
      const result = await window.api.logs.getLogConfiguration(taskDefinitionArn!, containerName!)
      // Construct log stream name: {prefix}/{containerName}/{taskId}
      const taskId = taskArn!.split('/').pop()
      const logStreamName = `${result.logStreamPrefix}/${containerName}/${taskId}`
      logStreamNameRef.current = logStreamName
      return { ...result, logStreamName }
    },
    enabled: !!taskDefinitionArn && !!containerName && !!taskArn,
    staleTime: Infinity // Log config doesn't change
  })

  // Step 2: Fetch logs with polling when tailing
  const { isLoading: isLoadingLogs, error: logsError } = useQuery({
    queryKey: ['logs', logConfig?.logGroupName, logStreamNameRef.current, nextTokenRef.current],
    queryFn: async () => {
      if (!logConfig) return null

      const result = await window.api.logs.getContainerLogs(
        logConfig.logGroupName,
        logStreamNameRef.current!,
        logConfig.region,
        nextTokenRef.current,
        !nextTokenRef.current // Start from head on first fetch
      )

      // Only update if we got new logs (token changed)
      if (result.nextForwardToken !== nextTokenRef.current) {
        setAllLogs((prev) => [...prev, ...result.events])
        nextTokenRef.current = result.nextForwardToken
      }

      return result
    },
    enabled: !!logConfig && !!logStreamNameRef.current && isTailing,
    refetchInterval: isTailing ? 2000 : false, // Poll every 2 seconds when tailing
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsContainerRef.current && allLogs.length > 0) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [allLogs, autoScroll])

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toISOString().replace('T', ' ').substring(0, 23)
  }

  const startTailing = async (): Promise<void> => {
    // Reset state and start fresh
    setAllLogs([])
    nextTokenRef.current = undefined
    setIsTailing(true)
    setAutoScroll(true)
  }

  const stopTailing = (): void => {
    setIsTailing(false)
  }

  if (isLoadingConfig) {
    return (
      <div>
        <Link
          to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`}
        >
          ← Back to Containers
        </Link>
        <h1>Logs - {containerName}</h1>
        <p>Loading log configuration...</p>
      </div>
    )
  }

  if (configError) {
    return (
      <div>
        <Link
          to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`}
        >
          ← Back to Containers
        </Link>
        <h1>Logs - {containerName}</h1>
        <p style={{ color: 'red' }}>
          Error loading log configuration:{' '}
          {configError instanceof Error ? configError.message : 'Unknown error'}
        </p>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
          Make sure the container uses the awslogs log driver and has proper CloudWatch Logs
          configuration.
        </p>
      </div>
    )
  }

  if (!logConfig) {
    return (
      <div>
        <Link
          to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`}
        >
          ← Back to Containers
        </Link>
        <h1>Logs - {containerName}</h1>
        <p>No log configuration available</p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 40px)',
        width: '100%'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Link
          to={`/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`}
        >
          ← Back to Containers
        </Link>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ margin: 0 }}>Logs - {containerName}</h1>
        {!isTailing ? (
          <button
            onClick={startTailing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Start Tailing
          </button>
        ) : (
          <>
            <button
              onClick={stopTailing}
              style={{
                padding: '8px 16px',
                backgroundColor: '#d9534f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Stop Tailing
            </button>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {isLoadingLogs ? 'Loading...' : `${allLogs.length} logs`}
            </span>
          </>
        )}
      </div>

      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
        <div>Log Group: {logConfig.logGroupName}</div>
        <div>Log Stream: {logStreamNameRef.current}</div>
        <div>Region: {logConfig.region}</div>
      </div>

      {isTailing && (
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label
            style={{ fontSize: '14px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Auto-scroll
          </label>
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true)
                if (logsContainerRef.current) {
                  logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
                }
              }}
              style={{
                padding: '4px 12px',
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Jump to Bottom
            </button>
          )}
        </div>
      )}

      {logsError && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#3a2020',
            border: '1px solid #d9534f',
            borderRadius: '4px',
            marginBottom: '12px'
          }}
        >
          <strong style={{ color: '#d9534f' }}>Error loading logs:</strong>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {logsError instanceof Error ? logsError.message : 'Unknown error'}
          </div>
          {logsError instanceof Error &&
            logsError.message.includes('ResourceNotFoundException') && (
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#888' }}>
                The log stream may not exist yet. The container might still be starting up, or logs
                haven&apos;t been created.
              </div>
            )}
        </div>
      )}

      <div
        style={{
          flex: 1,
          border: '1px solid #444',
          borderRadius: '4px',
          backgroundColor: '#0a0a0a',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        {allLogs.length === 0 && !isLoadingLogs ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
            {isTailing ? 'Waiting for logs...' : 'Click "Start Tailing" to view logs'}
          </div>
        ) : (
          <div
            ref={logsContainerRef}
            style={{
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {allLogs.map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  padding: '4px 12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  borderBottom: '1px solid #1a1a1a',
                  display: 'flex',
                  alignItems: 'flex-start',
                  minHeight: '22px',
                  userSelect: 'text',
                  cursor: 'text'
                }}
              >
                <span style={{ color: '#888', marginRight: '8px', flexShrink: 0 }}>
                  {formatTimestamp(log.timestamp)}
                </span>
                <span style={{ flex: 1 }}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Logs
