import { useState, useEffect } from 'react' // Import useEffect
import { useAuth } from '../../context/useAuth'
import { useNavigate } from 'react-router-dom'
import { BadgePlus, Cog, FileClock, FolderKanban, Inbox, LogOut, Menu, Search, Star, X } from 'lucide-react' // Import Star icon
import CreateTaskModal from '../common/CreateTaskModal' // Import the CreateTaskModal
import axios from 'axios' // Import axios for task creation and project fetching
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Sidebar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false) // New state for modal visibility
    const [createTaskError, setCreateTaskError] = useState(null) // New state for errors during task creation
    const [favoriteProjects, setFavoriteProjects] = useState([]); // New state for favorite projects
    const [projectsLoading, setProjectsLoading] = useState(true); // Loading state for projects

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // New handler for creating tasks from the sidebar
    const handleCreateTaskFromSidebar = async (taskData) => {
        setCreateTaskError(null); // Clear previous errors
        const token = localStorage.getItem('token');
        if (!token) {
            setCreateTaskError('Authentication token not found. Please log in again.');
            return;
        }

        try {
            await axios.post(`${API_URL}/tasks`, taskData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            toast.success('Added Task!')
            // Close modal on success
            // Optionally, you might want to refetch tasks in relevant pages after creation
            // For example, if you are currently on the Inbox page, you might want to trigger a refresh there.
            // This would typically be handled with a global state update or a specific context/hook.
        } catch (err) {
            console.error('Failed to create task:', err);
            setCreateTaskError(err.response?.data?.message || 'Failed to create task');
        }
    };

    // Fetch favorite projects
    useEffect(() => {
        const fetchFavoriteProjects = async () => {
            setProjectsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setProjectsLoading(false);
                    return;
                }
                const res = await axios.get(`${API_URL}/projects`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Filter for projects that are favored and not the inbox
                const favored = res.data.filter(project => project.isFavorite && !project.isInbox);
                setFavoriteProjects(favored);
            } catch (err) {
                console.error('Failed to fetch favorite projects:', err);
                // Optionally set an error state here if you want to display it
            } finally {
                setProjectsLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in
            fetchFavoriteProjects();
        }
    }, [user]); // Re-fetch when user changes (e.g., login/logout)


    return (
        <>
            {/* Toggle Button */}
            <button
                className="md:hidden fixed top-5 left-4 z-50 bg-white text-black dark:bg-zinc-700 dark:text-white p-2 rounded shadow-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-full w-72 bg-[#EAEAEA] dark:text-white dark:bg-zinc-800 border-r border-zinc-700 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                <div className="p-4 space-y-4 flex flex-col h-full justify-between">
                    <div>
                        
                        <button
                            className="flex items-center gap-x-3 w-full text-left px-3 py-2 rounded text-blue-600 hover:bg-blue-700 hover:text-white transition-colors font-semibold mt-12 md:mt-0"
                            onClick={() => setShowCreateModal(true)} // Open modal from sidebar
                        >
                            <BadgePlus /> Add Task
                        </button>

                        <nav className="mt-6 space-y-2 text-gray-700">
                            <button className="flex items-center gap-x-3 w-full text-left px-3 py-2 rounded hover:bg-zinc-700 dark:text-white transition-colors" onClick={() => {navigate('/dashboard/search'); setIsOpen(false)} }>
                                <Search /> Search
                            </button>
                            <button className="flex items-center gap-x-3 w-full text-left px-3 py-2 rounded hover:bg-zinc-700 dark:text-white transition-colors" onClick={() => {navigate('/dashboard/inbox'); setIsOpen(false)}}>
                                <Inbox /> Inbox
                            </button>
                            <button className="flex items-center gap-x-3 w-full text-left px-3 py-2 rounded hover:bg-zinc-700 dark:text-white transition-colors" onClick={() => {navigate('/dashboard/projects'); setIsOpen(false)}}>
                                <FolderKanban /> Projects
                            </button>
                            <button className="flex items-center gap-x-3 w-full text-left px-3 py-2 rounded hover:bg-zinc-700 dark:text-white transition-colors" onClick={() => {navigate('/dashboard/activity-log'); setIsOpen(false)}}>
                                <FileClock /> Activity Log
                            </button>
                            <button className="flex items-center gap-x-3 w-full text-left px-3 py-2 rounded hover:bg-zinc-700 dark:text-white transition-colors" onClick={() => {navigate('/dashboard/settings'); setIsOpen(false)}}>
                                <Cog /> Settings
                            </button>
                            <div className="mt-4">
                                <h4 className="text-xs text-gray-400 mb-1">Favorites</h4>
                                <ul className="space-y-1 text-sm">
                                    {projectsLoading ? (
                                        <li className="px-3 py-1 text-gray-500">Loading favorites...</li>
                                    ) : favoriteProjects.length === 0 ? (
                                        <li className="px-3 py-1 text-gray-500 italic">No favorites yet.</li>
                                    ) : (
                                        favoriteProjects.map(project => (
                                            <li key={project._id}>
                                                <button
                                                    className="flex items-center gap-x-2 w-full text-left px-3 py-1 hover:bg-zinc-700 dark:text-white rounded transition-colors"
                                                    onClick={() => {
                                                        // Navigate to a project-specific tasks page
                                                        // You'll need to set up a route like /dashboard/projects/:id
                                                        navigate(`/dashboard/projects?projectId=${project._id}`); // Example: pass project ID as query param
                                                        setIsOpen(false); // Close sidebar on navigation
                                                    }}
                                                >
                                                    <Star size={16} fill="currentColor" className="text-yellow-500" />
                                                    {project.name}
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </nav>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-white border-t border-gray-400 pt-4">
                        {user && (
                            <div className="mb-3 flex items-center">
                                <div>
                                    <img src={user.avatarUrl || `https://placehold.co/40x40/cccccc/333333?text=${user.firstName.charAt(0)}`} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-2" />
                                </div>
                                <div>
                                    <div className="font-semibold">{user.firstName} {user.lastName}</div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</div>
                                </div>
                            </div>
                        )}
                        <button
                            className="flex items-center justify-start gap-x-3 w-full text-center px-3 py-2 rounded hover:bg-red-600 text-red-500 hover:text-white transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 bg-opacity-30 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* CreateTaskModal for Sidebar */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setCreateTaskError(null); // Clear error when closing modal
                }}
                onTaskCreated={handleCreateTaskFromSidebar}
            // No defaultProjectId prop here, so project selection will be visible
            />
            {createTaskError && (
                <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded shadow-lg z-50">
                    {createTaskError}
                </div>
            )}
        </>
    )
}

export default Sidebar;
