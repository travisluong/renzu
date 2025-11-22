import { Routes, Route, Link } from 'react-router-dom'
import OriginalApp from './archive/App.original'
import Clusters from './pages/Clusters'
import Services from './pages/Services'

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

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/clusters" element={<Clusters />} />
      <Route path="/clusters/:clusterName/services" element={<Services />} />
      <Route path="/original" element={<OriginalApp />} />
    </Routes>
  )
}

export default App
