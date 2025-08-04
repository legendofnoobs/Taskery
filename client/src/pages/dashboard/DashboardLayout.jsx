// src/pages/dashboard/DashboardLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import { useEffect } from 'react'
import useAuth from '../../context/useAuth'

const DashboardLayout = () => {
    const {user} = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
    }, [user, navigate])

    return (
        <div className="flex min-h-screen bg-gray-200 dark:bg-zinc-900 w-full">
            <Sidebar />
            <main className="flex-1 p-4 max-w-6xl mx-auto">
                <Outlet /> {/* Render nested routes here */}
            </main>
        </div>
    )
}

export default DashboardLayout
