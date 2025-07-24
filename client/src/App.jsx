
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
// import Dashboard from './pages/dashboard/Dashboard'
import Inbox from './pages/dashboard/Inbox'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import ActivityLog from './pages/dashboard/ActivityLog'
import SearchPage from './pages/dashboard/SearchPage'
import Settings from './pages/dashboard/Settings'
import Projects from './pages/dashboard/Projects'

function App() {
    return (
        <div className="font-sans text-gray-800">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Nested Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    {/* <Route index element={<DashboardHome />} /> */}
                    <Route path="inbox" element={<Inbox />} />
                    <Route path="activity-log" element={<ActivityLog />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="projects" element={<Projects />} />
                </Route>
            </Routes>
        </div>
    )
}

export default App