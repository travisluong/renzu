import { Link, useLocation } from 'react-router-dom'
import styles from '../styles/Breadcrumbs.module.css'

interface BreadcrumbItem {
  label: string
  path: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

function Breadcrumbs({ items }: BreadcrumbsProps): React.JSX.Element {
  const location = useLocation()

  return (
    <nav className={styles.breadcrumbs}>
      <Link to="/" className={styles.breadcrumbLink}>
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isActive = location.pathname === item.path

        return (
          <span key={item.path} className={styles.breadcrumbItem}>
            <span className={styles.separator}>/</span>
            {isLast || isActive ? (
              <span className={styles.breadcrumbCurrent}>{item.label}</span>
            ) : (
              <Link to={item.path} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
