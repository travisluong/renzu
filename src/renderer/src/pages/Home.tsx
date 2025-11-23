import { Link } from 'react-router-dom'

function Home(): React.JSX.Element {
  return (
    <div>
      <h1>Hello World</h1>
      <nav>
        <Link to="/clusters">View ECS Clusters</Link>
        <br />
        <Link to="/original">View Original App</Link>
      </nav>
    </div>
  )
}

export default Home
