import { Routes, Route } from 'react-router-dom'
import OriginalApp from './archive/App.original'
import Home from './pages/Home'
import Clusters from './pages/Clusters'
import Services from './pages/Services'
import Tasks from './pages/Tasks'
import Containers from './pages/Containers'
import Logs from './pages/Logs'

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/clusters" element={<Clusters />} />
      <Route path="/clusters/:clusterName/services" element={<Services />} />
      <Route path="/clusters/:clusterName/services/:serviceName/tasks" element={<Tasks />} />
      <Route
        path="/clusters/:clusterName/services/:serviceName/tasks/:taskArn/containers"
        element={<Containers />}
      />
      <Route
        path="/clusters/:clusterName/services/:serviceName/tasks/:taskArn/containers/:containerName/logs"
        element={<Logs />}
      />
      <Route path="/original" element={<OriginalApp />} />
    </Routes>
  )
}

export default App
