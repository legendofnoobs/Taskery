/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useMemo } from 'react';
import { BadgePlus, Inbox, ArrowDownWideNarrow, ArrowUpWideNarrow, AlignEndHorizontal, ArrowDownUp, ArrowLeft } from 'lucide-react';
import CreateTaskModal from '../../components/common/CreateTaskModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import TaskDetailsModal from '../../components/common/TaskDetailsModal';
import TaskCard from '../../components/common/TaskCard';
import axios from 'axios';
import toast from 'react-hot-toast'; // Ensure this import is correct

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InboxPage = () => {
    // State for tasks and loading status
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const [sortOrder, setSortOrder] = useState('default');

    const token = localStorage.getItem('token');

    const fetchInboxTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                return;
            }

            // Fetch all projects to find the inbox project
            const resProjects = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const inboxProject = resProjects.data.find(p => p.isInbox);
            if (!inboxProject) {
                throw new Error("Inbox project not found. Please ensure it exists on the backend.");
            }

            setSelectedProjectId(inboxProject._id);

            // Fetch tasks for the identified inbox project
            const tasksRes = await axios.get(`${API_URL}/tasks/project/${inboxProject._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Failed to fetch inbox tasks:', err);
            setError(err.response?.data?.message || 'Failed to fetch inbox tasks.');
            setTasks([]); // Clear tasks on error
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch of inbox tasks on component mount
    useEffect(() => {
        fetchInboxTasks();
    }, [token]); // Re-fetch if token changes (e.g., user logs in/out)

    // Effect to handle clicks outside of any task dropdown menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]); // Re-run effect if openDropdownId changes

    /**
     * Handles the creation of a new task.
     * @param {object} taskData - The data for the new task.
     */
    const handleCreateTask = async (taskData) => {
        if (!selectedProjectId) {
            console.warn('Inbox project ID is not available. Cannot create task.');
            setError('Inbox not ready to add tasks. Please wait or refresh.');
            return;
        }

        try {
            await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                projectId: selectedProjectId, // Ensure task is assigned to the inbox project
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowCreateModal(false);
            toast.success('Added Task!');
            fetchInboxTasks(); // Re-fetch tasks to update the list
        } catch (err) {
            console.error('Failed to create task:', err);
            setError(err.response?.data?.message || 'Failed to create task.');
        }
    };

    /**
     * Toggles the completion status of a task.
     * @param {object} task - The task object to toggle.
     */
    const toggleComplete = async (task) => {
        try {
            const endpoint = task.isCompleted ? 'uncomplete' : 'complete';
            await axios.patch(`${API_URL}/tasks/${task._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Optimistically update local state for immediate feedback
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t))
            );
            if (task.isCompleted) toast.error('Task Uncompleted!');
            else toast.success('Task Completed!');
            fetchInboxTasks(); // Re-fetch to ensure data consistency with backend
        } catch (err) {
            console.error(`Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`, err);
            setError(err.response?.data?.message || `Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task.`);
        }
    };

    /**
     * Handles the update of an existing task.
     * This is typically called from the EditTaskModal.
     * @param {object} updatedTask - The updated task object.
     */
    const handleUpdateTask = (updatedTask) => {
        // Optimistically update local state
        setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
        toast.success('Updated Task!');
        fetchInboxTasks(); // Re-fetch to ensure data consistency
    };

    /**
     * Sets the task to be deleted and opens the confirmation modal.
     * @param {object} task - The task object to confirm deletion for.
     */
    const confirmDelete = (task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
        setOpenDropdownId(null); // Close any open dropdown
    };

    /**
     * Executes the task deletion after confirmation.
     */
    const handleDeleteTaskConfirmed = async () => {
        if (!taskToDelete) return;

        try {
            await axios.delete(`${API_URL}/tasks/${taskToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTasks(prev => prev.filter(t => t._id !== taskToDelete._id)); // Optimistic removal
            setShowDeleteModal(false);
            setTaskToDelete(null);
            toast.success('Deleted Task!');
            fetchInboxTasks(); // Re-fetch to ensure full consistency
        } catch (err) {
            console.error('Failed to delete task:', err);
            setError(err.response?.data?.message || 'Failed to delete task.');
            setShowDeleteModal(false);
            setTaskToDelete(null);
        }
    };

    /**
     * Sets the task to be viewed in detail and opens the details modal.
     * @param {object} task - The task object to view details for.
     */
    const handleViewDetails = (task) => {
        setViewingTask(task);
        setShowDetailsModal(true);
        setOpenDropdownId(null); // Close any open dropdown
    };

    const getSortedTasks = useMemo(() => {
        let sorted = [...tasks]; // Create a shallow copy to avoid mutating original state

        switch (sortOrder) {
            case 'priority':
                // Corrected priorityMap to use numeric keys as per your task object structure
                // 0: None, 1: Low, 2: Medium, 3: High, 4: Urgent
                // eslint-disable-next-line no-case-declarations
                const priorityMap = { 1: 1, 2: 2, 3: 3, 4: 4 };
                sorted.sort((a, b) => {
                    // Use nullish coalescing (??) to default to 0 if priority is null/undefined
                    const valA = priorityMap[a.priority ?? 0];
                    const valB = priorityMap[b.priority ?? 0];
                    return valB - valA; // Descending priority (Urgent first, then High, Medium, Low, None)
                });
                break;
            case 'dateAsc':
                sorted.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; // Tasks without date go last
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    return dateA - dateB; // Nearest to furthest
                });
                break;
            case 'dateDesc':
                sorted.sort((a, b) => {
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity; // Tasks without date go last
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
                    return dateB - dateA; // Furthest to nearest
                });
                break;
            case 'default':
            default:
                // No specific sorting, rely on the order from the API fetch
                break;
        }
        return sorted;
    }, [tasks, sortOrder]); // Re-calculate when tasks or sortOrder changes

    const handleSortChange = () => {
        setSortOrder(prevOrder => {
            switch (prevOrder) {
                case 'default':
                    toast.success("Sorted by priority!");
                    return 'priority';
                case 'priority':
                    toast.success("Sorted by nearest date!");
                    return 'dateAsc';
                case 'dateAsc':
                    toast.success("Sorted by furthest date!");
                    return 'dateDesc';
                case 'dateDesc':
                    toast.success("Sorted by default order!");
                    return 'default';
                default:
                    return 'default';
            }
        });
    };

    // const sortButtonText = useMemo(() => {
    //     switch (sortOrder) {
    //         case 'priority':
    //             return 'Priority';
    //         case 'dateAsc':
    //             return 'Date (Nearest)';
    //         case 'dateDesc':
    //             return 'Date (Furthest)';
    //         default:
    //             return 'Default Order';
    //     }
    // }, [sortOrder]);

    const sortIcon = useMemo(() => {
        switch (sortOrder) {
            case 'dateAsc':
                return <ArrowUpWideNarrow className="w-4 h-4 dark:text-zinc-100" />;
            case 'dateDesc':
                return <ArrowDownWideNarrow className="w-4 h-4 dark:text-zinc-100" />;
            case 'priority':
                return <AlignEndHorizontal className="w-4 h-4 dark:text-zinc-100" />;
            default:
                return <ArrowDownUp className="w-4 h-4 dark:text-zinc-100" />; // Default sort icon
        }
    }, [sortOrder]);

    // Separate tasks into incomplete and completed
    const incompleteTasks = getSortedTasks.filter(task => !task.isCompleted);
    const completedTasks = getSortedTasks.filter(task => task.isCompleted);

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            {/* Fixed Header for Inbox Title and Add Task Button */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-gray-100/50 dark:bg-zinc-800/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <div className='flex items-center gap-2'>
                    <button className="p-1 rounded-full hover:bg-gray-200 transition-colors mr-2 block md:hidden" aria-label="Back to Projects">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold"><Inbox className="w-6 h-6" /> Inbox</h1>
                </div>
                <div className="flex items-center gap-4"> {/* Container for buttons */}
                    <button
                        onClick={handleSortChange}
                        className="flex items-center gap-2 font-semibold px-2 py-2 rounded-full text-gray-700 hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors text-sm"
                    >
                        {sortIcon}
                        {/* <span className='hidden lg:block'>Sort: {sortButtonText}</span>  */}
                        {/* Show text on larger screens */}
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedProjectId) {
                                console.warn('Inbox project not ready. Please wait or refresh.');
                                setError('Inbox not ready to add tasks. Please wait.');
                                return;
                            }
                            setShowCreateModal(true);
                        }}
                        disabled={!selectedProjectId}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full lg:rounded disabled:opacity-50 gap-x-3 text-blue-600 hover:bg-blue-700 hover:text-white transition-colors text-sm"
                    >
                        <BadgePlus className="w-4 h-4" />
                        <span className='hidden lg:block'>Add Task</span>
                    </button>
                </div>
            </div>

            {/* Spacer div to prevent content from being hidden behind the fixed header */}
            <div className="pt-10 pb-18"> {/* Adjust this padding based on the fixed header's height */}
                {loading ? (
                    <div className="text-gray-500">Loading tasks...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <>
                        {/* Incomplete Tasks Section */}
                        {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
                            <div className="text-gray-400 italic">No tasks in inbox.</div>
                        ) : (
                            <>
                                {incompleteTasks.length > 0 && (
                                    <ul className="space-y-4 mb-8">
                                        {incompleteTasks.map((task) => (
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

                                {/* Completed Tasks Section */}
                                {completedTasks.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-xl font-semibold text-gray-600 mb-4 flex items-center gap-2">
                                            Completed Tasks ({completedTasks.length})
                                        </h2>
                                        <ul className="space-y-4 opacity-70"> {/* Slightly dim completed tasks */}
                                            {completedTasks.map((task) => (
                                                <TaskCard
                                                    key={task._id}
                                                    task={task}
                                                    onToggleComplete={toggleComplete}
                                                    onViewDetails={handleViewDetails}
                                                    onEditTask={(taskToEdit) => {
                                                        setEditingTask(taskToEdit);
                                                        setOpenDropdownId(null);
                                                    }}
                                                    onConfirmDelete={confirmDelete}
                                                    openDropdownId={openDropdownId}
                                                    setOpenDropdownId={setOpenDropdownId}
                                                    dropdownRef={dropdownRef}
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

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
                    setTaskToDelete(null);
                }}
                onConfirm={handleDeleteTaskConfirmed}
                title="Delete Task"
                message={taskToDelete ? `Are you sure you want to delete the task "${taskToDelete.content}"? This action cannot be undone.` : "Are you sure you want to delete this task? This action cannot be undone."}
            />

            <TaskDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setViewingTask(null);
                }}
                task={viewingTask}
            />
        </div>
    );
};

export default InboxPage;
