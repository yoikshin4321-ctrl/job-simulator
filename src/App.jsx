import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import SimulationPage from './pages/SimulationPage'
import SimulationDetailPage from './pages/SimulationDetailPage'
import ReportPage from './pages/ReportPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AboutPage from './pages/AboutPage'
import ResultPage from './pages/ResultPage'

export default function App() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen self-stretch">
      <ErrorBoundary>
        <NavBar />
        <main className="w-full flex-1 flex flex-col items-center">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/simulation/:id" element={<SimulationDetailPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  )
}
