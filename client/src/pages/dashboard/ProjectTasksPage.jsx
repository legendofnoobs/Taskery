/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useMemo } from 'react'; // Import useMemo for sorting
import axios from 'axios';
import { FolderKanban, Plus, ArrowLeft, BadgePlus, ArrowDownWideNarrow, ArrowUpWideNarrow, AlignEndHorizontal, ArrowDownUp } from 'lucide-react'; // Import sorting icons
import TaskCard from '../../components/common/TaskCard';
import CreateTaskModal from '../../components/common/CreateTaskModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal'; // Corrected import path
import TaskDetailsModal from '../../components/common/TaskDetailsModal';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Page component to display tasks for a specific project.
 * @param {object} props - Component props.
 * @param {object} props.project - The project object for which to display tasks.
 * @param {function} props.onBackToProjects - Callback to navigate back to the projects list.
 */
const ProjectTasksPage = ({ project, onBackToProjects }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

    const [viewingTask, setViewingTask] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [sortOrder, setSortOrder] = useState('default');

    const token = localStorage.getItem('token');

    /**
     * Fetches tasks specifically for the current project.
     */
    const fetchProjectTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }
            if (!project || !project._id) {
                setError('Project information is missing.');
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/tasks/project/${project._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (err) {
            console.error(`Failed to fetch tasks for project ${project?.name || 'N/A'}:`, err);
            setError(err.response?.data?.message || `Failed to fetch tasks for ${project?.name || 'this project'}.`);
            setTasks([]); // Clear tasks on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch tasks when the project or token changes
    useEffect(() => {
        if (project && project._id) {
            fetchProjectTasks();
        }
    }, [project, token]);

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
    }, [openDropdownId]);

    /**
     * Handles the creation of a new task for the current project.
     * @param {object} taskData - The data for the new task.
     */
    const handleCreateTask = async (taskData) => {
        try {
            await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                projectId: project._id, // Assign to the current project
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Added Task!');
            setShowCreateModal(false);
            fetchProjectTasks(); // Re-fetch tasks after creation
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
            // Optimistically update the task's completion status in the local state
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t))
            );
            if (task.isCompleted) toast.error('Task Uncompleted!');
            else toast.success('Task Completed!');
            fetchProjectTasks(); // Re-fetch to ensure consistency
        } catch (err) {
            console.error(`Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`, err);
            setError(err.response?.data?.message || `Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`);
        }
    };

    /**
     * Handles the update of an existing task.
     * @param {object} updated - The updated task object.
     */
    const handleUpdateTask = (updated) => {
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
        fetchProjectTasks(); // Re-fetch to ensure consistency
    };

    /**
     * Sets the task to be deleted and opens the confirmation modal.
     * @param {object} task - The task object to confirm deletion for.
     */
    const confirmDelete = (task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
        setOpenDropdownId(null);
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
            setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
            setShowDeleteModal(false);
            setTaskToDelete(null);
            toast.success('Deleted Task!');
            fetchProjectTasks(); // Re-fetch to ensure consistency
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
        setOpenDropdownId(null);
    };

    /**
     * Memoized function to sort tasks based on the current sortOrder state.
     * Tasks without due dates are always placed at the end for date sorting.
     */
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

    /**
     * Cycles through the available sort orders.
     */
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

    /**
     * Memoized text to display on the sort button indicating the current sort order.
     */
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

    /**
     * Memoized icon to display next to the sort button based on the current sort order.
     */
    const sortIcon = useMemo(() => {
        switch (sortOrder) {
            case 'dateAsc':
                return <ArrowUpWideNarrow className="w-4 h-4 dark:text-white" />;
            case 'dateDesc':
                return <ArrowDownWideNarrow className="w-4 h-4 dark:text-white" />;
            case 'priority':
                return <AlignEndHorizontal className="w-4 h-4 dark:text-white" />;
            default:
                return <ArrowDownUp className="w-4 h-4 dark:text-white" />; // Default sort icon
        }
    }, [sortOrder]);

    if (!project) {
        return <div className="md:ml-72 mt-8 px-4 py-6 text-red-500">Project not found.</div>;
    }

    // Separate tasks into incomplete and completed
    const incompleteTasks = getSortedTasks.filter(task => !task.isCompleted);
    const completedTasks = getSortedTasks.filter(task => task.isCompleted);

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            {/* Fixed Header for Project Title and Add Task Button */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-gray-100/50 dark:bg-zinc-800/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <h1 className="flex items-center gap-2 text-xl md:text-2xl font-bold">
                    <button onClick={onBackToProjects} className="p-1 rounded-full hover:bg-gray-300 transition-colors mr-2 dark:hover:bg-zinc-700" aria-label="Back to Projects">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <FolderKanban className="w-6 h-6" /> {project.name}
                </h1>
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
                        onClick={() => setShowCreateModal(true)}
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
                            <div className="text-gray-400 italic">No tasks in this project.</div>
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
                                                    setOpenDropdownId(null);
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
                defaultProjectId={project._id} // Pass the current project ID
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

export default ProjectTasksPage;
