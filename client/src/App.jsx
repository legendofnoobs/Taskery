
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
import NotesPage from './pages/dashboard/NotesPage'
import { Toaster } from 'react-hot-toast'
import AiChatPage from './pages/dashboard/AiChatPage'

function App() {
    return (
        <div className="text-gray-800 dark:text-white dark:bg-zinc-900">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Nested Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route path="inbox" element={<Inbox />} />
                    <Route path="activity-log" element={<ActivityLog />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="notes" element={<NotesPage />} />
                    <Route path="ai-chat" element={<AiChatPage />} />
                </Route>
            </Routes>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: { fontSize: '0.9rem' }
                }}
            />
        </div>
    )
}

export default App