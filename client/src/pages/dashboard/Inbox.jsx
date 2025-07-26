// src/pages/InboxPage.jsx
import { useState, useRef, useEffect } from 'react';
import { BadgePlus, Inbox, ArrowLeft } from 'lucide-react';
import CreateTaskModal from '../../components/common/CreateTaskModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import TaskDetailsModal from '../../components/common/TaskDetailsModal'; // Keep this for now if you still want a modal option
import TaskCard from '../../components/common/TaskCard';
import { useInboxTasks } from '../../hooks/useInboxTasks';
import { useTaskSorting } from '../../hooks/useTaskSorting.jsx';
import toast from 'react-hot-toast';
import TaskDetailsPage from '../../components/common/TaskDetailsPage.jsx'; // Import the new TaskDetailsPage component

const InboxPage = () => {
    // Use the custom hook for task data and API interactions
    const {
        tasks,
        loading,
        error,
        selectedProjectId,
        selectedTaskForDetails, // <--- NEW: Get selectedTaskForDetails from hook
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
        handleTaskCardClick, // <--- NEW: Get click handler from hook
        handleBackToInbox, // <--- NEW: Get back handler from hook
    } = useInboxTasks();

    // Use the custom hook for sorting logic
    const {
        getSortedTasks,
        handleSortChange,
        sortIcon,
    } = useTaskSorting(tasks);

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    // const [viewingTask, setViewingTask] = useState(null); // No longer directly used for page view
    // const [showDetailsModal, setShowDetailsModal] = useState(false); // No longer directly used for page view

    // Ref for dropdowns to handle clicks outside
    const dropdownRef = useRef(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const today = new Date();
    const defaultTodayDate = today.toISOString().split('T')[0]; // Formats as "YYYY-MM-DD"

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
        setShowDeleteModal(true);
        setOpenDropdownId(null); // Close any open dropdown
    };

    /**
     * Executes the task deletion after confirmation.
     */
    const onDeleteConfirmed = async () => {
        if (taskToDelete) {
            await handleDeleteTaskConfirmed(taskToDelete._id);
            setShowDeleteModal(false);
            setTaskToDelete(null);
        }
    };

    // Conditionally render TaskDetailsPage or the list of tasks
    if (selectedTaskForDetails) {
        return <TaskDetailsPage task={selectedTaskForDetails} onBackToInbox={handleBackToInbox} />;
    }

    // Separate tasks into incomplete and completed using the sorted tasks
    const incompleteTasks = getSortedTasks.filter(task => !task.isCompleted);
    const completedTasks = getSortedTasks.filter(task => task.isCompleted);

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            {/* Fixed Header for Inbox Title and Add Task Button */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md"> {/* Changed background to static */}
                <div className='flex items-center gap-2'>
                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 block md:hidden" aria-label="Back to Inbox"> {/* Changed hover background */}
                        <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" /> {/* Changed text color */}
                    </button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"><Inbox className="w-6 h-6" /> Inbox</h1> {/* Changed text and icon color to static */}
                </div>
                <div className="flex items-center gap-4"> {/* Container for buttons */}
                    <button
                        onClick={handleSortChange}
                        className="flex items-center gap-2 font-semibold px-2 py-2 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                    >
                        {sortIcon}
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedProjectId) {
                                toast.error('Inbox not ready to add tasks. Please wait.');
                                return;
                            }
                            setShowCreateModal(true);
                        }}
                        disabled={!selectedProjectId}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                    >
                        <BadgePlus className="w-4 h-4" />
                        <span className='hidden lg:block'>Add Task</span>
                    </button>
                </div>
            </div>

            {/* Spacer div to prevent content from being hidden behind the fixed header */}
            <div className="pt-10 pb-18"> {/* Adjust this padding based on the fixed header's height */}
                {loading ? (
                    <div className="text-gray-900 dark:text-white opacity-70">Loading tasks...</div>
                ) : error ? (
                <div className="text-red-500">{error}</div>
                ) : (
                <>
                    {/* Incomplete Tasks Section */}
                    {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
                        <div className="text-gray-900 dark:text-white opacity-50 italic">No tasks in inbox.</div> 
                    ) : (
                    <>
                        {incompleteTasks.length > 0 && (
                            <ul className="space-y-4 mb-8">
                                <h1 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
                                    {incompleteTasks.length} Tasks
                                </h1>
                                {incompleteTasks.map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onToggleComplete={toggleComplete}
                                        onViewDetails={handleTaskCardClick} // <--- CHANGED: Use handleTaskCardClick for page view
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
                                <h2 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
                                    You have Completed {completedTasks.length} Tasks!
                                </h2>
                                <ul className="space-y-4 opacity-60"> {/* Slightly dim completed tasks */}
                                    {completedTasks.map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onToggleComplete={toggleComplete}
                                            onViewDetails={handleTaskCardClick} // <--- CHANGED: Use handleTaskCardClick for page view
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

            {/* Modals */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTaskCreated={handleCreateTask}
                defaultProjectId={selectedProjectId}
                defaultDueDate={defaultTodayDate} // Pass today's date here
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

            {/* TaskDetailsModal is still here, but can be removed if you exclusively use TaskDetailsPage */}
            {/* If you want *both* a modal and a page, you'd need to rename this component or make its usage clearer */}
            {/* For now, I'll comment it out to focus on the page pattern */}
            {/*
            <TaskDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setViewingTask(null);
                }}
                task={viewingTask}
            />
            */}
        </div>
    );
};

export default InboxPage;