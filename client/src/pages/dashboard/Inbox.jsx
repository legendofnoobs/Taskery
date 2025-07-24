/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react' // Import useRef for click outside
import { BadgePlus, Inbox } from 'lucide-react' // Removed CheckCircle, Circle, MoreVertical, Dot, Tag as they are now in TaskCard
import CreateTaskModal from '../../components/common/CreateTaskModal'
import EditTaskModal from '../../components/common/EditTaskModal'
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal'
import TaskDetailsModal from '../../components/common/TaskDetailsModal' // Import TaskDetailsModal
import TaskCard from '../../components/common/TaskCard' // Import the reusable TaskCard component
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const InboxPage = () => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [error, setError] = useState(null)
    const [editingTask, setEditingTask] = useState(null)

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // State for managing which task's dropdown is open
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

    // State for task details modal
    const [viewingTask, setViewingTask] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const token = localStorage.getItem('token')

    const fetchInboxTasks = async () => {
        try {
            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const inboxProject = res.data.find(p => p.isInbox)
            if (!inboxProject) throw new Error("Inbox project not found")

            setSelectedProjectId(inboxProject._id)

            const tasksRes = await axios.get(`${API_URL}/tasks/project/${inboxProject._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setTasks(tasksRes.data)
            return inboxProject._id
        } catch (err) {
            console.error('Failed to fetch inbox tasks:', err)
            setError('Failed to fetch inbox tasks')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInboxTasks()
    }, [])

    // Effect to handle clicks outside of the dropdown menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the dropdown is open and the click is outside its container, close it
            // Ensure the click is not on a dropdown button itself to prevent immediate re-opening
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        // Add event listener when component mounts
        document.addEventListener('mousedown', handleClickOutside);
        // Clean up the event listener when component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]); // Re-run effect if openDropdownId changes

    const handleCreateTask = async (taskData) => {
        if (!selectedProjectId) {
            console.warn('Inbox project ID is not ready yet.')
            setError('Inbox not ready to add tasks. Please wait.')
            return
        }

        try {
            await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                projectId: selectedProjectId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setShowCreateModal(false)
            fetchInboxTasks() // Re-fetch all tasks after successful creation
        } catch (err) {
            console.error('Failed to create task:', err)
            setError(err.response?.data?.message || 'Failed to create task');
        }
    }

    const toggleComplete = async (task) => {
        try {
            const endpoint = task.isCompleted ? 'uncomplete' : 'complete'
            const res = await axios.patch(`${API_URL}/tasks/${task._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Optimistically update the task's completion status in the local state
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? res.data : t))
            )
            // Re-fetch to ensure consistency (optional, but good for robustness)
            fetchInboxTasks()
        } catch (err) {
            console.error(`Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`, err)
            setError(err.response?.data?.message || `Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`);
        }
    }

    const handleUpdateTask = (updated) => {
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t))
        fetchInboxTasks() // Re-fetch to ensure consistency
    }

    // Function to open the delete confirmation modal
    const confirmDelete = (task) => {
        setTaskToDelete(task); // Store the task to be deleted
        setShowDeleteModal(true); // Open the modal
        setOpenDropdownId(null); // Close the dropdown menu
    }

    // Modified handleDeleteTask to be called when the modal confirms deletion
    const handleDeleteTaskConfirmed = async () => {
        if (!taskToDelete) return;

        try {
            await axios.delete(`${API_URL}/tasks/${taskToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setTasks(prev => prev.filter(t => t._id !== taskToDelete._id)) // Optimistic removal
            setShowDeleteModal(false); // Close the modal
            setTaskToDelete(null); // Clear the task to delete
            fetchInboxTasks(); // Re-fetch to ensure full consistency
        } catch (err) {
            console.error('Failed to delete task:', err)
            setError(err.response?.data?.message || 'Failed to delete task');
            setShowDeleteModal(false); // Close the modal even on error
            setTaskToDelete(null); // Clear the task to delete
        }
    }

    // Function to open the details modal
    const handleViewDetails = (task) => {
        setViewingTask(task);
        setShowDetailsModal(true);
        setOpenDropdownId(null); // Close the dropdown menu
    }

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold"><Inbox className="w-6 h-6" /> Inbox</h1>
                <button
                    onClick={() => {
                        if (!selectedProjectId) {
                            console.warn('Inbox project not ready. Please wait or refresh.')
                            setError('Inbox not ready to add tasks. Please wait.')
                            return
                        }
                        setShowCreateModal(true)
                    }}
                    disabled={!selectedProjectId}
                    className="flex items-center gap-2 font-bold px-4 py-2 rounded disabled:opacity-50 gap-x-3 text-blue-600 hover:bg-blue-700 hover:text-white transition-colors"
                >
                    <BadgePlus className="w-4 h-4" />
                    Add Task
                </button>
            </div>

            {loading ? (
                <div className="text-gray-500">Loading tasks...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : tasks.length === 0 ? (
                <div className="text-gray-400 italic">No tasks in inbox.</div>
            ) : (
                <ul className="space-y-4">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onToggleComplete={toggleComplete}
                            onViewDetails={handleViewDetails}
                            onEditTask={(taskToEdit) => {
                                setEditingTask(taskToEdit);
                                setOpenDropdownId(null); // Close dropdown
                            }}
                            onConfirmDelete={confirmDelete}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            dropdownRef={dropdownRef}
                        />
                    ))}
                </ul>
            )}

            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTaskCreated={handleCreateTask}
                defaultProjectId={selectedProjectId}
            />

            <EditTaskModal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                task={editingTask}
                onUpdate={handleUpdateTask}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setTaskToDelete(null); // Clear the task when closing
                }}
                onConfirm={handleDeleteTaskConfirmed}
                title="Delete Task"
                message={taskToDelete ? `Are you sure you want to delete the task "${taskToDelete.content}"? This action cannot be undone.` : "Are you sure you want to delete this task? This action cannot be undone."}
            />

            <TaskDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setViewingTask(null); // Clear the task when closing
                }}
                task={viewingTask}
            />
        </div>
    )
}

export default InboxPage;
