import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Circle, Tag, Loader2, Edit, Trash2, BadgePlus, ListTree } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'; // Corrected import for Framer Motion
import CreateTaskModal from './CreateTaskModal'; // Assuming path to common components
import TaskCard from './TaskCard'; // Assuming path to common components
import EditTaskModal from './EditTaskModal'; // Assuming path to common components
import DeleteConfirmationModal from './DeleteConfirmationModal'; // Assuming path to common components

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * TaskDetailsPage component displays the details of a single task,
 * including its description, due date, priority, tags, and a list of its subtasks.
 * It allows for editing and deleting the main task, as well as managing subtasks
 * (creating, toggling completion, editing, and deleting).
 *
 * @param {object} props - The component props.
 * @param {object} props.task - The main task object to display details for.
 * @param {function} props.onBackToInbox - Callback function to navigate back to the main tasks list (e.g., inbox or project tasks).
 * @param {function} props.onTaskUpdated - Callback function to notify the parent when the main task is updated.
 * @param {function} props.onTaskDeleted - Callback function to notify the parent when the main task is deleted.
 */
const TaskDetailsPage = ({ task, onBackToInbox, onTaskUpdated, onTaskDeleted }) => {
    // State for managing subtasks related to the main task
    const [subtasks, setSubtasks] = useState([]);
    const [loadingSubtasks, setLoadingSubtasks] = useState(true);
    const [subtaskError, setSubtaskError] = useState(null);

    // State for managing subtask creation modal
    const [isCreateSubtaskModalOpen, setIsCreateSubtaskModalOpen] = useState(false);

    // State for subtask completion percentage
    const [subtaskCompletionPercentage, setSubtaskCompletionPercentage] = useState(0);
    const [loadingCompletion, setLoadingCompletion] = useState(true);

    // States for managing main task editing and deletion modals
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // States for managing subtask editing and deletion modals
    const [isEditSubtaskModalOpen, setIsEditSubtaskModalOpen] = useState(false);
    const [editingSubtask, setEditingSubtask] = useState(null); // Stores the subtask currently being edited

    const [isDeleteSubtaskModal, setIsDeleteSubtaskModal] = useState(false);
    const [deletingSubtask, setDeletingSubtask] = useState(null); // Stores the subtask currently being deleted

    // State and ref for managing the open state of subtask dropdown menus
    const [openSubtaskDropdownId, setOpenSubtaskDropdownId] = useState(null);
    const subtaskDropdownRef = useRef(null);

    // Define Framer Motion variants for the container (<ul>) of subtasks.
    // These variants control the staggered animation of child TaskCard components.
    const subtaskContainerVariants = {
        hidden: { opacity: 0 }, // Initial state: invisible
        visible: {
            opacity: 1, // Target state: fully visible
            transition: {
                staggerChildren: 0.05, // Delay between each child's animation start
                delayChildren: 0.05   // Initial delay before the first child starts animating
            }
        }
    };

    /**
     * Effect hook to handle clicks outside the subtask dropdown menu.
     * Closes the dropdown if a click occurs outside of it.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (subtaskDropdownRef.current && !subtaskDropdownRef.current.contains(event.target)) {
                setOpenSubtaskDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [subtaskDropdownRef]); // Dependency array ensures effect re-runs if ref changes (unlikely)

    /**
     * Effect hook to fetch subtasks and their completion percentage when the main task's ID changes.
     */
    useEffect(() => {
        if (task?._id) { // Only fetch if a task ID is available
            fetchSubtasks(task._id);
            fetchSubtaskCompletionPercentage(task._id);
        }
    }, [task?._id]); // Re-run effect when task ID changes

    /**
     * Fetches subtasks for a given parent task ID from the API.
     * @param {string} parentId - The ID of the parent task.
     */
    const fetchSubtasks = async (parentId) => {
        setLoadingSubtasks(true); // Set loading state
        setSubtaskError(null); // Clear previous errors
        try {
            const token = localStorage.getItem('token'); // Retrieve authentication token
            const response = await axios.get(`${API_URL}/tasks/subtasks/${parentId}`, {
                headers: { Authorization: `Bearer ${token}` } // Include token in headers
            });
            setSubtasks(response.data); // Update subtasks state with fetched data
        } catch (err) {
            console.error('Failed to fetch subtasks:', err);
            setSubtaskError('Failed to load subtasks.'); // Set error message
        } finally {
            setLoadingSubtasks(false); // Clear loading state
        }
    };

    /**
     * Fetches the completion percentage of subtasks for a given parent task ID.
     * @param {string} parentId - The ID of the parent task.
     */
    const fetchSubtaskCompletionPercentage = async (parentId) => {
        setLoadingCompletion(true); // Set loading state
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/tasks/completion/${parentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubtaskCompletionPercentage(response.data.percentage); // Update completion percentage state
        } catch (err) {
            console.error('Failed to fetch subtask completion percentage:', err);
            // Optionally set an error state here if you want to display it
        } finally {
            setLoadingCompletion(false); // Clear loading state
        }
    };

    /**
     * Handles the creation of a new subtask.
     * @param {object} newSubtaskData - The data for the new subtask.
     */
    const handleSubtaskCreated = async (newSubtaskData) => {
        try {
            const token = localStorage.getItem('token');
            // Attach parentId to the new subtask data
            const taskDataWithParent = { ...newSubtaskData, parentId: task._id };
            const res = await axios.post(`${API_URL}/tasks`, taskDataWithParent, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubtasks((prev) => [...prev, res.data]); // Add new subtask to the list
            fetchSubtaskCompletionPercentage(task._id); // Recalculate completion
            setIsCreateSubtaskModalOpen(false); // Close the modal
        } catch (err) {
            console.error('Error creating subtask:', err.response?.data?.message || err.message);
            // Use a custom message box instead of alert for better UX
            // alert('Failed to create subtask: ' + (err.response?.data?.message || err.message));
        }
    };

    /**
     * Toggles the completion status of a subtask.
     * @param {object} subtaskToToggle - The subtask object to toggle.
     */
    const handleToggleSubtaskComplete = async (subtaskToToggle) => {
        try {
            const token = localStorage.getItem('token');
            const newCompletionStatus = !subtaskToToggle.isCompleted; // Determine new status
            const endpoint = newCompletionStatus ? 'complete' : 'uncomplete';
            await axios.patch(`${API_URL}/tasks/${subtaskToToggle._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update the subtask's completion status in local state
            setSubtasks((prev) =>
                prev.map((sub) =>
                    sub._id === subtaskToToggle._id ? { ...sub, isCompleted: newCompletionStatus } : sub
                )
            );
            fetchSubtaskCompletionPercentage(task._id); // Recalculate completion
        } catch (err) {
            console.error(`Error toggling subtask completion:`, err);
            // alert(`Failed to toggle subtask completion.`);
        }
    };

    /**
     * Opens the edit modal for a specific subtask.
     * @param {object} subtaskToEdit - The subtask object to be edited.
     */
    const handleEditSubtask = (subtaskToEdit) => {
        setEditingSubtask(subtaskToEdit); // Set the subtask to be edited
        setIsEditSubtaskModalOpen(true); // Open the edit modal
        setOpenSubtaskDropdownId(null); // Close any open dropdown
    };

    /**
     * Handles the update of a subtask after it's edited in the modal.
     * @param {object} updatedSubtask - The updated subtask object.
     */
    const handleSubtaskUpdated = (updatedSubtask) => {
        // Update the subtask in the local state
        setSubtasks((prev) =>
            prev.map((sub) => (sub._id === updatedSubtask._id ? updatedSubtask : sub))
        );
        setIsEditSubtaskModalOpen(false); // Close the modal
        setEditingSubtask(null); // Clear the editing subtask
    };

    /**
     * Opens the delete confirmation modal for a specific subtask.
     * @param {object} subtaskToDelete - The subtask object to be deleted.
     */
    const handleConfirmDeleteSubtask = (subtaskToDelete) => {
        setDeletingSubtask(subtaskToDelete); // Set the subtask to be deleted
        setIsDeleteSubtaskModal(true); // Open the delete modal
        setOpenSubtaskDropdownId(null); // Close any open dropdown
    };

    /**
     * Handles the actual deletion of a subtask after confirmation.
     */
    const handleDeleteSubtask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/tasks/${deletingSubtask._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove the deleted subtask from local state
            setSubtasks((prev) => prev.filter((sub) => sub._id !== deletingSubtask._id));
            fetchSubtaskCompletionPercentage(task._id); // Recalculate completion
            setIsDeleteSubtaskModal(false); // Close the modal
            setDeletingSubtask(null); // Clear the deleting subtask
        } catch (err) {
            console.error('Error deleting subtask:', err);
            // alert('Failed to delete subtask.');
            setIsDeleteSubtaskModal(false);
            setDeletingSubtask(null);
        }
    };

    /**
     * Opens the edit modal for the main task.
     */
    const handleEditMainTask = () => {
        setIsEditTaskModalOpen(true);
    };

    /**
     * Handles the update of the main task after it's edited in the modal.
     * Notifies the parent component about the update.
     * @param {object} updatedTask - The updated main task object.
     */
    const handleMainTaskUpdated = (updatedTask) => {
        onTaskUpdated(updatedTask); // Call parent callback
        setIsEditTaskModalOpen(false); // Close the modal
    };

    /**
     * Opens the delete confirmation modal for the main task.
     */
    const handleConfirmDeleteMainTask = () => {
        setIsDeleteModalOpen(true);
    };

    /**
     * Handles the actual deletion of the main task after confirmation.
     * Notifies the parent component about the deletion.
     */
    const handleDeleteMainTask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/tasks/${task._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onTaskDeleted(task._id); // Call parent callback
            setIsDeleteModalOpen(false); // Close the modal
        } catch (err) {
            console.error('Error deleting task:', err);
            // alert('Failed to delete task.');
            setIsDeleteModalOpen(false);
        }
    };

    /**
     * Returns the Tailwind CSS text color class based on priority level.
     * @param {number} priority - The priority level (1-4).
     * @returns {string} Tailwind CSS class.
     */
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'text-blue-500'; // Low
            case 2: return 'text-green-500'; // Medium
            case 3: return 'text-yellow-500'; // High
            case 4: return 'text-red-500'; // Urgent
            default: return 'text-gray-400'; // Default/None
        }
    };

    /**
     * Returns a human-readable label for the priority level.
     * @param {number} priority - The priority level (1-4).
     * @returns {string} Priority label.
     */
    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
            case 4: return 'Urgent';
            default: return 'None';
        }
    };

    // If no task is provided, display a "Task not found" message with a back button.
    if (!task) {
        return (
            <div className="md:ml-72 mt-8 px-4 py-6 text-center text-gray-500">
                Task not found.
                <button
                    onClick={onBackToInbox}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Back to Project Tasks
                </button>
            </div>
        );
    }

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            {/* Fixed header for task details page */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <div className='flex items-center gap-2'>
                    <button
                        onClick={onBackToInbox}
                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 flex items-center gap-1 text-gray-900 dark:text-white ml-12 md:ml-0"
                        aria-label="Back to Inbox"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Details</h1>
                </div>
                <div className="flex gap-2"> {/* Container for main task action buttons */}
                    {/* Edit Task Button */}
                    <button
                        onClick={handleEditMainTask}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                        aria-label="Edit Task"
                    >
                        <div className='flex items-center gap-2'>
                            <Edit className="w-4 h-4" />
                            <span className='hidden md:block'>
                                Edit
                            </span>
                        </div>
                    </button>
                    {/* Delete Task Button */}
                    <button
                        onClick={handleConfirmDeleteMainTask}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 bg-red-500 hover:bg-red-600 transition-colors text-sm text-white"
                        aria-label="Delete Task"
                    >
                        <div className='flex items-center gap-2'>
                            <Trash2 className="w-4 h-4" />
                            <span className='hidden md:block'>
                                Delete
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Main content area, with padding to account for fixed header */}
            <div className="pt-10 pb-18">
                {/* Main Task Details Card */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md space-y-4">
                    <h2 className={`text-3xl font-bold ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.content}
                    </h2>
                    {task.description && (
                        <p className="text-gray-700 dark:text-zinc-400 text-lg">
                            {task.description}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 dark:text-zinc-300">
                        {task.dueDate && (
                            <div className="flex items-center gap-2 text-md">
                                <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </div>
                        )}
                        {task.priority !== undefined && task.priority !== null && (
                            <div className="flex items-center gap-2 text-md">
                                <strong>Priority:</strong> <span className={getPriorityColor(task.priority)}>{getPriorityLabel(task.priority)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-md">
                            <strong>Status:</strong> {task.isCompleted ? (
                                <span className="flex items-center text-green-500">
                                    <CheckCircle className="w-5 h-5 mr-1" /> Completed
                                </span>
                            ) : (
                                <span className="flex items-center text-gray-500 dark:text-zinc-400">
                                    <Circle className="w-5 h-5 mr-1" /> Incomplete
                                </span>
                            )}
                        </div>
                        {task.projectId && (
                            <div className="flex items-center gap-2 text-md">
                                <strong>Project ID:</strong> <span className="font-mono text-sm">{task.projectId}</span>
                            </div>
                        )}
                        {/* Display Subtask Count for the Main Task */}
                        {loadingSubtasks ? (
                            <div className="flex items-center gap-2 text-md text-gray-600 dark:text-zinc-400">
                                <Loader2 className="animate-spin w-4 h-4" /> Loading subtask count...
                            </div>
                        ) : (
                            subtasks.length > 0 && (
                                <div className="flex items-center gap-2 text-md">
                                    <strong>Subtasks:</strong>
                                    <span className="px-2 py-1 text-sm rounded bg-gray-200 text-gray-700 dark:text-white dark:bg-zinc-700 flex items-center gap-1">
                                        <ListTree className='w-4 h-4' /> {subtasks.length} Subtask{subtasks.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center pt-4 border-t border-gray-200 dark:border-zinc-700">
                            <strong className='text-gray-900 dark:text-white'>Tags:</strong>
                            {task.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
                                    <Tag className="w-4 h-4" /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subtasks Section */}
                <div className="mt-4 bg-transparent rounded-xl ">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Subtasks</h3>
                        <button
                            onClick={() => setIsCreateSubtaskModalOpen(true)}
                            className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                        >
                            <BadgePlus className="w-4 h-4" /> Add Subtask
                        </button>
                    </div>

                    {/* Subtask Completion Progress Bar */}
                    {loadingCompletion ? (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                            <Loader2 className="animate-spin w-4 h-4" /> Loading completion...
                        </div>
                    ) : (
                        <div className="mb-8 text-gray-700 dark:text-zinc-300">
                            <p>Completion: <span className="font-semibold">{subtaskCompletionPercentage}%</span></p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-700 mt-2">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${subtaskCompletionPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Conditional rendering for subtask list based on loading, error, or empty state */}
                    {loadingSubtasks ? (
                        <div className="text-center text-gray-500 dark:text-zinc-400 py-4">
                            <Loader2 className="animate-spin inline-block mr-2" /> Loading subtasks...
                        </div>
                    ) : subtaskError ? (
                        <p className="text-red-600 text-center py-4">{subtaskError}</p>
                    ) : subtasks.length === 0 ? (
                        <p className="text-gray-500 dark:text-zinc-400 text-center py-4">No subtasks for this task yet.</p>
                    ) : (
                        // Framer Motion ul for staggered animation of subtasks
                        <motion.ul
                            className="space-y-3"
                            variants={subtaskContainerVariants} // Apply variants defined above
                            initial="hidden"                     // Start animation from 'hidden' state
                            animate="visible"                    // Animate to 'visible' state (triggers staggerChildren)
                            // Key changes when the main task ID changes, forcing the ul and its children to re-animate
                            key={task._id}
                        >
                            {/* AnimatePresence enables exit animations for individual TaskCards when they are removed */}
                            <AnimatePresence>
                                {subtasks.map((subtask) => (
                                    <TaskCard
                                        key={subtask._id} // Crucial unique key for React and AnimatePresence
                                        task={subtask}
                                        onToggleComplete={handleToggleSubtaskComplete}
                                        onEditTask={handleEditSubtask}
                                        onConfirmDelete={handleConfirmDeleteSubtask}
                                        onViewDetails={null} // Subtasks don't typically have nested details in this view
                                        openDropdownId={openSubtaskDropdownId}
                                        setOpenDropdownId={setOpenSubtaskDropdownId}
                                        dropdownRef={subtaskDropdownRef}
                                        isSubtask={true} // Prop to apply subtask-specific styling
                                        onClick={null} // Subtasks are not clickable for further details in this context
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.ul>
                    )}
                </div>
            </div>

            {/* Modals for creating, editing, and deleting tasks/subtasks */}

            {/* Create Subtask Modal */}
            <CreateTaskModal
                isOpen={isCreateSubtaskModalOpen}
                onClose={() => setIsCreateSubtaskModalOpen(false)}
                onTaskCreated={handleSubtaskCreated}
                defaultProjectId={task.projectId} // Inherit project ID from parent task
                defaultDueDate={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''} // Inherit due date
            />

            {/* Edit Main Task Modal */}
            <EditTaskModal
                isOpen={isEditTaskModalOpen}
                onClose={() => setIsEditTaskModalOpen(false)}
                task={task} // Pass the main task object
                onUpdate={handleMainTaskUpdated}
            />

            {/* Delete Main Task Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteMainTask}
                title="Delete Task"
                message={`Are you sure you want to delete the task: "${task.content}"? This action cannot be undone.`}
            />

            {/* Edit Subtask Modal (conditionally rendered only when a subtask is being edited) */}
            {editingSubtask && (
                <EditTaskModal
                    isOpen={isEditSubtaskModalOpen}
                    onClose={() => { setIsEditSubtaskModalOpen(false); setEditingSubtask(null); }}
                    task={editingSubtask} // Pass the specific subtask being edited
                    onUpdate={handleSubtaskUpdated}
                />
            )}

            {/* Delete Subtask Confirmation Modal (conditionally rendered) */}
            {deletingSubtask && (
                <DeleteConfirmationModal
                    isOpen={isDeleteSubtaskModal}
                    onClose={() => { setIsDeleteSubtaskModal(false); setDeletingSubtask(null); }}
                    onConfirm={handleDeleteSubtask}
                    title="Delete Subtask"
                    message={deletingSubtask ? `Are you sure you want to delete the subtask "${deletingSubtask.content}"? This action cannot be undone.` : "Are you sure you want to delete this subtask? This action cannot be undone."}
                />
            )}
        </div>
    );
};

export default TaskDetailsPage;