/* eslint-disable no-unused-vars */
// src/pages/dashboard/DashboardLayout.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const DashboardLayout = () => {
    const [projects, setProjects] = useState([])
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [error, setError] = useState(null)
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await axios.get(`${API_URL}/projects`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const userProjects = res.data || []

                setProjects(userProjects)

                if (userProjects.length > 0) {
                    setSelectedProjectId(userProjects[0]._id)
                } else {
                    // fallback to inbox project
                    const inboxRes = await axios.get(`${API_URL}/projects/inbox`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })

                    if (inboxRes.data?._id) {
                        setSelectedProjectId(inboxRes.data._id)
                        setProjects([inboxRes.data])
                    }
                }
            } catch (err) {
                console.error('Failed to load projects:', err)
                setError('Failed to load projects')
            }
        }
    }, [])

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900 w-full">
            <Sidebar />
            <main className="flex-1 p-4 max-w-6xl mx-auto">
                <Outlet /> {/* Render nested routes here */}
            </main>
        </div>
    )
}

export default DashboardLayout
