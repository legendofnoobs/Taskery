import { useState, useRef, useEffect } from 'react';
import { BadgePlus, Inbox, ArrowLeft, CalendarDays, Flag, MoreVertical } from 'lucide-react'; // Added MoreVertical for options menu
import CreateTaskModal from '../../components/common/CreateTaskModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import TaskCard from '../../components/common/TaskCard';
import { useInboxTasks } from '../../hooks/useInboxTasks';
import { useTaskSorting } from '../../hooks/useTaskSorting.jsx';
import toast from 'react-hot-toast';
import TaskDetailsPage from '../../components/common/TaskDetailsPage.jsx';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';

const InboxPage = () => {
    // State for filter selections
    const [selectedDueDateFilter, setSelectedDueDateFilter] = useState('all');
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');

    // Use the custom hook for task data and API interactions, passing filters
    const {
        tasks,
        loading,
        error,
        selectedProjectId,
        selectedTaskForDetails,
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
        handleTaskCardClick,
        handleBackToInbox,
    } = useInboxTasks(selectedDueDateFilter, selectedPriorityFilter); // Pass filter states here

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

    // Ref for dropdowns to handle clicks outside
    const dropdownRef = useRef(null); // For task card dropdowns
    const optionsMenuRef = useRef(null); // For the new options menu dropdown
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false); // State for options menu visibility

    const today = new Date();
    const defaultTodayDate = today.toISOString().split('T')[0]; // Formats as "YYYY-MM-DD"

    // Framer Motion variants for the task list container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        },
        exit: { opacity: 0 }
    };

    // Effect to handle clicks outside of any task dropdown menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
            // Also close the options menu if click is outside
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId, showOptionsMenu]); // Add showOptionsMenu to dependencies

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
        return (
            <TaskDetailsPage
                task={selectedTaskForDetails}
                onBackToInbox={handleBackToInbox}
                onTaskUpdated={handleUpdateTask}
                onTaskDeleted={() => handleDeleteTaskConfirmed(selectedTaskForDetails._id)}
            />
        );
    }

    // Separate tasks into incomplete and completed using the sorted tasks
    const incompleteTasks = getSortedTasks.filter(task => !task.isCompleted);
    const completedTasks = getSortedTasks.filter(task => task.isCompleted);

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            {/* Fixed Header for Inbox Title and Add Task Button */}
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <div className='flex items-center gap-2'>
                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 block md:hidden" aria-label="Back to Inbox">
                        <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"><Inbox className="w-6 h-6" /> Inbox</h1>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 justify-end"> {/* Simplified flex for the right side */}
                    <button
                        onClick={() => {
                            if (!selectedProjectId) {
                                toast.error('Inbox not ready to add tasks. Please wait.');
                                return;
                            }
                            setShowCreateModal(true);
                        }}
                        disabled={!selectedProjectId}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm whitespace-nowrap"
                    >
                        <BadgePlus className="w-4 h-4" />
                        <span className='hidden lg:block'>Add Task</span>
                    </button>
                    {/* Options Menu Button */}
                    <div className="relative" ref={optionsMenuRef}>
                        <button
                            onClick={() => setShowOptionsMenu(prev => !prev)}
                            className="p-2 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Task Options"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Options Dropdown Menu */}
                        {showOptionsMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg py-2 z-20 border border-gray-300 dark:border-zinc-700">
                                {/* Sort Option */}
                                <button
                                    onClick={() => { handleSortChange(); setShowOptionsMenu(false); }}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors text-sm"
                                >
                                    {sortIcon} Sort Tasks
                                </button>

                                {/* Due Date Filter */}
                                <div className="px-4 py-2">
                                    <label htmlFor="dueDateFilter" className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Due Date</label>
                                    <div className="relative">
                                        <select
                                            id="dueDateFilter"
                                            value={selectedDueDateFilter}
                                            onChange={(e) => { setSelectedDueDateFilter(e.target.value); setShowOptionsMenu(false); }}
                                            className="appearance-none bg-zinc-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-md py-1 pl-2 pr-7 text-xs font-medium cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                                        >
                                            <option value="all">All Dates</option>
                                            <option value="today">Today</option>
                                            <option value="tomorrow">Tomorrow</option>
                                            <option value="this_week">This Week</option>
                                            <option value="overdue">Overdue</option>
                                        </select>
                                        <CalendarDays className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-700 dark:text-gray-300 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Priority Filter */}
                                <div className="px-4 py-2">
                                    <label htmlFor="priorityFilter" className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">Priority</label>
                                    <div className="relative">
                                        <select
                                            id="priorityFilter"
                                            value={selectedPriorityFilter}
                                            onChange={(e) => { setSelectedPriorityFilter(e.target.value); setShowOptionsMenu(false); }}
                                            className="appearance-none bg-zinc-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-md py-1 pl-2 pr-7 text-xs font-medium cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                                        >
                                            <option value="all">All Priorities</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                        <Flag className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-700 dark:text-gray-300 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer div to prevent content from being hidden behind the fixed header */}
            <div className="pt-10 pb-18">
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
                                    <>
                                        <h1 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
                                            {incompleteTasks.length} Tasks
                                        </h1>
                                        <motion.ul
                                            className="space-y-4 mb-8"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            key={`inbox-incomplete-${selectedProjectId}-${tasks.length}-${selectedDueDateFilter}-${selectedPriorityFilter}`}
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
                                                        subtaskCount={task.subtaskCount || 0}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </motion.ul>
                                    </>
                                )}

                                {/* Completed Tasks Section */}
                                {completedTasks.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
                                            You have Completed {completedTasks.length} Tasks!
                                        </h2>
                                        <motion.ul
                                            className="space-y-4 opacity-60"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            key={`inbox-completed-${selectedProjectId}-${tasks.length}-${selectedDueDateFilter}-${selectedPriorityFilter}`}
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
                                                        subtaskCount={task.subtaskCount || 0}
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
                defaultProjectId={selectedProjectId}
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

export default InboxPage;
