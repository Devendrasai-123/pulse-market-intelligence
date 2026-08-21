import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Logs from './pages/Logs'
import About from './pages/About'
import Architecture from './pages/Architecture'
import Team from './pages/Team'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="logs" element={<Logs />} />
          <Route path="about" element={<About />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="team" element={<Team />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
