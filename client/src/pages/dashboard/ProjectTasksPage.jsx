import React, { useState, useEffect, useRef } from 'react';
import { FolderKanban, ArrowLeft, BadgePlus } from 'lucide-react';
import TaskCard from '../../components/common/TaskCard';
import CreateTaskModal from '../../components/common/CreateTaskModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'; // Import motion and AnimatePresence

import { useProjectTasks } from '../../hooks/useProjectTasks';
import { useTaskSorting } from '../../hooks/useTaskSorting';
import TaskDetailsPage from '../../components/common/TaskDetailsPage';

/**
 * Page component to display tasks for a specific project.
 * @param {object} props - Component props.
 * @param {object} props.project - The project object for which to display tasks.
 * @param {function} props.onBackToProjects - Callback to navigate back to the projects list.
 */
const ProjectTasksPage = ({ project, onBackToProjects }) => {
    const navigate = useNavigate(); // Initialize useNavigate
    const location = useLocation(); // Initialize useLocation to read query params

    // Extract taskId from URL if present
    const queryParams = new URLSearchParams(location.search);
    const taskIdFromUrl = queryParams.get('taskId');

    // Use the custom hook for project tasks data and API interactions
    const {
        tasks,
        loading,
        error,
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
    } = useProjectTasks(project); // Pass the project prop to the hook

    // Use the custom hook for sorting logic
    const {
        getSortedTasks,
        handleSortChange,
        sortIcon,
    } = useTaskSorting(tasks); // Pass tasks to the sorting hook

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const today = new Date();
    const defaultTodayDate = today.toISOString().split('T')[0]; // Formats as "YYYY-MM-DD"

    // State for managing which task's dropdown is open
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

    // Framer Motion variants for the task list container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05, // Delay between each child item's animation
                delayChildren: 0.1     // Initial delay before the first child starts animating
            }
        },
        exit: { opacity: 0 } // Basic exit for the container if needed
    };

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
     * Sets the task to be deleted and opens the confirmation modal.
     * @param {object} task - The task object to confirm deletion for.
     */
    const confirmDelete = (task) => {
        setTaskToDelete(task);
        setOpenDropdownId(null);
        setShowDeleteModal(true);
    };

    /**
     * Executes the task deletion after confirmation.
     */
    const onDeleteConfirmed = async () => {
        if (taskToDelete) {
            await handleDeleteTaskConfirmed(taskToDelete._id);
            setTaskToDelete(null);
            setShowDeleteModal(false);
            // If the deleted task was the one being viewed, navigate back from details page
            if (taskIdFromUrl === taskToDelete._id) {
                navigate(`/dashboard/projects?projectId=${project._id}`); // Navigate back to project tasks without taskId
            }
        }
    };

    /**
     * Navigates to the TaskDetailsPage with the task ID in the URL.
     * @param {object} task - The task object to view details for.
     */
    const handleTaskCardClick = (task) => {
        navigate(`/dashboard/projects?projectId=${project._id}&taskId=${task._id}`);
        setOpenDropdownId(null); // Close any open dropdown
    };

    // Find the selected task if taskId is present in the URL
    const selectedTaskForDetails = taskIdFromUrl ? tasks.find(t => t._id === taskIdFromUrl) : null;

    if (!project) {
        return <div className="md:ml-72 mt-8 px-4 py-6 text-red-500">Project not found.</div>;
    }

    // --- Conditional Render: Show TaskDetailsPage if a task is selected ---
    if (selectedTaskForDetails) {
        return (
            <TaskDetailsPage
                task={selectedTaskForDetails}
                onBackToInbox={() => navigate(`/dashboard/projects?projectId=${project._id}`)} // Navigate back to project tasks
                onTaskUpdated={(updatedTask) => {
                    handleUpdateTask(updatedTask); // Update the task in the ProjectTasksPage state
                    // Optionally, if the updated task's content is the current selectedTaskForDetails, update it
                    // This is more complex if you deeply mutate, so consider refreshing tasks or a more robust state management
                    // For now, assume handleUpdateTask re-fetches or updates locally
                }}
                onTaskDeleted={() => {
                    handleDeleteTaskConfirmed(selectedTaskForDetails._id); // Delete the task
                    navigate(`/dashboard/projects?projectId=${project._id}`); // Navigate back after deletion
                }}
            />
        );
    }
    // --- End Conditional Render ---

    // Separate tasks into incomplete and completed using the sorted tasks
    const incompleteTasks = getSortedTasks.filter(task => !task.isCompleted);
    const completedTasks = getSortedTasks.filter(task => task.isCompleted);

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            {/* Fixed Header for Project Title and Add Task Button */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <h1 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-white"> {/* Applied static colors */}
                    <button onClick={onBackToProjects} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 ml-12 md:ml-0" aria-label="Back to Projects"> {/* Applied static colors */}
                        <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" /> {/* Applied static colors */}
                    </button>
                    <FolderKanban className="w-6 h-6" />
                    {project.name}
                </h1>
                <div className="flex items-center gap-4"> {/* Container for buttons */}
                    <button
                        onClick={handleSortChange}
                        className="flex items-center gap-2 font-semibold px-2 py-2 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                    >
                        {sortIcon}
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                    >
                        <BadgePlus className="w-4 h-4" />
                        <span className='hidden lg:block'>Add Task</span>
                    </button>
                </div>
            </div>

            {/* Spacer div to prevent content from being hidden behind the fixed header */}
            <div className="pt-10 pb-18"> {/* Adjusted padding based on the fixed header's height */}
                {loading ? (
                    <div className="text-gray-900 dark:text-white opacity-70">Loading tasks...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <>
                        {/* Incomplete Tasks Section */}
                        {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
                            <div className="text-gray-900 dark:text-white opacity-50 italic">Start By Adding Some Tasks!</div>
                        ) : (
                            <>
                                {incompleteTasks.length > 0 && (
                                    <>
                                        <h1 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'> {/* Applied static colors */}
                                            {incompleteTasks.length} Tasks
                                        </h1>
                                        {/* Apply motion.ul and AnimatePresence here for incomplete tasks */}
                                        <motion.ul
                                            className="space-y-4 mb-8"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            key={project._id + '-incomplete-tasks'}
                                        >
                                            <AnimatePresence>
                                                {incompleteTasks.map((task) => (
                                                    <TaskCard
                                                        key={task._id}
                                                        task={task}
                                                        onToggleComplete={toggleComplete}
                                                        onViewDetails={handleTaskCardClick}
                                                        onEditTask={(taskToEdit) => {
                                                            setEditingTask(taskToEdit);
                                                            setOpenDropdownId(null);
                                                        }}
                                                        onConfirmDelete={confirmDelete}
                                                        openDropdownId={openDropdownId}
                                                        setOpenDropdownId={setOpenDropdownId}
                                                        dropdownRef={dropdownRef}
                                                        subtaskCount={task.subtaskCount || 0} // Ensure subtaskCount is passed if available
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.ul>
                                    </>
                                )}

                                {/* Completed Tasks Section */}
                                {completedTasks.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"> {/* Applied static colors */}
                                            You have Completed {completedTasks.length} Tasks!
                                        </h2>
                                        {/* Apply motion.ul and AnimatePresence here for completed tasks */}
                                        <motion.ul
                                            className="space-y-4 opacity-70" // Slightly dim completed tasks
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            // Unique key for completed tasks list
                                            key={project._id + '-completed-tasks'}
                                        >
                                            <AnimatePresence>
                                                {completedTasks.map((task) => (
                                                    <TaskCard
                                                        key={task._id}
                                                        task={task}
                                                        onToggleComplete={toggleComplete}
                                                        onViewDetails={handleTaskCardClick}
                                                        onEditTask={(taskToEdit) => {
                                                            setEditingTask(taskToEdit);
                                                            setOpenDropdownId(null);
                                                        }}
                                                        onConfirmDelete={confirmDelete}
                                                        openDropdownId={openDropdownId}
                                                        setOpenDropdownId={setOpenDropdownId}
                                                        dropdownRef={dropdownRef}
                                                        subtaskCount={task.subtaskCount || 0} // Ensure subtaskCount is passed if available
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.ul>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTaskCreated={handleCreateTask}
                defaultProjectId={project._id}
                defaultDueDate={defaultTodayDate}
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
                onConfirm={onDeleteConfirmed}
                title="Delete Task"
                message={taskToDelete ? `Are you sure you want to delete the task "${taskToDelete.content}"? This action cannot be undone.` : "Are you sure you want to delete this task? This action cannot be undone."}
            />
        </div>
    );
};

export default ProjectTasksPage;