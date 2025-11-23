import { Link } from 'react-router-dom'
import styles from '../styles/Home.module.css'

function Home(): React.JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Renzu</h1>
        <p className={styles.subtitle}>AWS ECS Container Management</p>
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
