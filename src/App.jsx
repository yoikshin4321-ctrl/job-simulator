import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import SimulationPage from './pages/SimulationPage'
import SimulationDetailPage from './pages/SimulationDetailPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen self-stretch">
      <NavBar />
      <main className="w-full flex-1 flex flex-col items-center">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/simulation/:id" element={<SimulationDetailPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </main>
    </div>
  )
}
