import { Link } from 'react-router-dom'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'

function Home(): React.JSX.Element {
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    const fetchVersion = async (): Promise<void> => {
      const v = await window.api.getAppVersion()
      setVersion(v)
    }
    fetchVersion()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Renzu</h1>
        <p className={styles.subtitle}>AWS ECS Container Management</p>
        <p className={styles.version}>v{version}</p>
      </div>

      <div className={styles.buttonGroup}>
        <Link to="/clusters" className={styles.primaryButton}>
          View ECS Clusters
        </Link>
        {/* <Link to="/original" className={styles.secondaryButton}>
          View Original App
        </Link> */}
      </div>
    </div>
  )
}

export default Home
