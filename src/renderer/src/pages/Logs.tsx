import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs'
import styles from '../styles/Logs.module.css'

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

  const taskId = taskArn?.split('/').pop() || ''

  const breadcrumbItems = [
    { label: 'Clusters', path: '/clusters' },
    {
      label: clusterName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services`
    },
    {
      label: serviceName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks`
    },
    {
      label: `Task ${taskId}`,
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers`
    },
    {
      label: containerName || '',
      path: `/clusters/${encodeURIComponent(clusterName || '')}/services/${encodeURIComponent(serviceName || '')}/tasks/${encodeURIComponent(taskArn || '')}/containers/${encodeURIComponent(containerName || '')}/logs`
    }
  ]

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
      <div className={styles.logsContainer}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.title}>Logs - {containerName}</h1>
        <p className={styles.loading}>Loading log configuration...</p>
      </div>
    )
  }

  if (configError) {
    return (
      <div className={styles.logsContainer}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.title}>Logs - {containerName}</h1>
        <p className={styles.error}>
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
      <div className={styles.logsContainer}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={styles.title}>Logs - {containerName}</h1>
        <p className={styles.empty}>No log configuration available</p>
      </div>
    )
  }

  return (
    <div className={styles.logsContainer}>
      <Breadcrumbs items={breadcrumbItems} />

      <div className={styles.header}>
        <h1 className={styles.title}>Logs - {containerName}</h1>
        {!isTailing ? (
          <button onClick={startTailing} className={`${styles.button} ${styles.buttonStart}`}>
            Start Tailing
          </button>
        ) : (
          <>
            <button onClick={stopTailing} className={`${styles.button} ${styles.buttonStop}`}>
              Stop Tailing
            </button>
            <span className={styles.logCount}>
              {isLoadingLogs ? 'Loading...' : `${allLogs.length} logs`}
            </span>
          </>
        )}
      </div>

      <div className={styles.configInfo}>
        <div>
          <span className={styles.configLabel}>Log Group:</span>
          {logConfig.logGroupName}
        </div>
        <div>
          <span className={styles.configLabel}>Log Stream:</span>
          {logStreamNameRef.current}
        </div>
        <div>
          <span className={styles.configLabel}>Region:</span>
          {logConfig.region}
        </div>
      </div>

      {isTailing && (
        <div className={styles.controls}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
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
              className={styles.buttonJump}
            >
              Jump to Bottom
            </button>
          )}
        </div>
      )}

      {logsError && (
        <div className={styles.errorBox}>
          <div className={styles.errorTitle}>Error loading logs:</div>
          <div className={styles.errorMessage}>
            {logsError instanceof Error ? logsError.message : 'Unknown error'}
          </div>
          {logsError instanceof Error &&
            logsError.message.includes('ResourceNotFoundException') && (
              <div className={styles.errorHint}>
                The log stream may not exist yet. The container might still be starting up, or logs
                haven&apos;t been created.
              </div>
            )}
        </div>
      )}

      <div className={styles.logsViewer}>
        {allLogs.length === 0 && !isLoadingLogs ? (
          <div className={styles.emptyState}>
            {isTailing ? 'Waiting for logs...' : 'Click "Start Tailing" to view logs'}
          </div>
        ) : (
          <div ref={logsContainerRef} className={styles.logsContent}>
            {allLogs.map((log, index) => (
              <div key={`${log.timestamp}-${index}`} className={styles.logEntry}>
                <span className={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</span>
                <span className={styles.logMessage}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Logs
