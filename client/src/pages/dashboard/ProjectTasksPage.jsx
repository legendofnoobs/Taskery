/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
    FolderKanban, ArrowLeft, BadgePlus, MoreVertical, CalendarDays, Flag
} from 'lucide-react';
import TaskCard from '../../components/common/TaskCard';
import CreateTaskModal from '../../components/common/CreateTaskModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useProjectTasks } from '../../hooks/useProjectTasks';
import { useTaskSorting } from '../../hooks/useTaskSorting';
import TaskDetailsPage from '../../components/common/TaskDetailsPage';

const ProjectTasksPage = ({ project, onBackToProjects }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const taskIdFromUrl = searchParams.get('taskId');

    // Get initial filter values from URL or use defaults
    const initialDueDateFilter = searchParams.get('dueDate') || 'all';
    const initialPriorityFilter = searchParams.get('priority') || 'all';

    const {
        tasks,
        loading,
        error,
        filters,
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
    } = useProjectTasks(project);

    const {
        getSortedTasks,
        handleSortChange,
        sortIcon,
    } = useTaskSorting(tasks);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const optionsMenuRef = useRef(null);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);

    const today = new Date();
    const defaultTodayDate = today.toISOString().split('T')[0];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            }
        },
        exit: { opacity: 0 },
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
                setShowOptionsMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId, showOptionsMenu]);

    const confirmDelete = (task) => {
        setTaskToDelete(task);
        setOpenDropdownId(null);
        setShowDeleteModal(true);
    };

    const onDeleteConfirmed = async () => {
        if (taskToDelete) {
            await handleDeleteTaskConfirmed(taskToDelete._id);
            setTaskToDelete(null);
            setShowDeleteModal(false);
            if (taskIdFromUrl === taskToDelete._id) {
                navigate(`/dashboard/projects?projectId=${project._id}`);
            }
        }
    };

    const handleTaskCardClick = (task) => {
        // Preserve filter parameters when navigating to task details
        navigate(`/dashboard/projects?projectId=${project._id}&taskId=${task._id}&dueDate=${filters.dueDate}&priority=${filters.priority}`);
        setOpenDropdownId(null);
    };

    const selectedTaskForDetails = taskIdFromUrl ? tasks.find(t => t._id === taskIdFromUrl) : null;

    if (!project) {
        return <div className="md:ml-72 mt-8 px-4 py-6 text-red-500">Project not found.</div>;
    }

    if (selectedTaskForDetails) {
        return (
            <TaskDetailsPage
                task={selectedTaskForDetails}
                onBackToInbox={() => navigate(`/dashboard/projects?projectId=${project._id}&dueDate=${filters.dueDate}&priority=${filters.priority}`)}
                onTaskUpdated={handleUpdateTask}
                onTaskDeleted={() => {
                    handleDeleteTaskConfirmed(selectedTaskForDetails._id);
                    navigate(`/dashboard/projects?projectId=${project._id}&dueDate=${filters.dueDate}&priority=${filters.priority}`);
                }}
            />
        );
    }

    const incompleteTasks = getSortedTasks.filter(task => !task.isCompleted);
    const completedTasks = getSortedTasks.filter(task => task.isCompleted);

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <h1 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    <button onClick={onBackToProjects} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 ml-12 md:ml-0" aria-label="Back to Projects">
                        <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>
                    <FolderKanban className="w-6 h-6 hidden sm:block" />
                    {project.name}
                </h1>

                <div className="flex items-center gap-4">
                    {/* Add Task */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                    >
                        <BadgePlus className="w-4 h-4" />
                        <span className='hidden lg:block'>Add Task</span>
                    </button>

                    {/* Options Menu */}
                    <div className="relative" ref={optionsMenuRef}>
                        <button
                            onClick={() => setShowOptionsMenu(prev => !prev)}
                            className="p-2 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-gray-900 dark:text-white"
                            aria-label="Task Options"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showOptionsMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg py-2 z-20 border border-gray-300 dark:border-zinc-700">
                                {/* Sort */}
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
                                            value={filters.dueDate}
                                            onChange={(e) => {
                                                filters.updateFilters({ dueDate: e.target.value });
                                                setShowOptionsMenu(false);
                                            }}
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
                                            value={filters.priority}
                                            onChange={(e) => {
                                                filters.updateFilters({ priority: e.target.value });
                                                setShowOptionsMenu(false);
                                            }}
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

            {/* Main Content */}
            <div className="pt-10 pb-18">
                {loading ? (
                    <div className="text-gray-900 dark:text-white opacity-70">Loading tasks...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <>
                        {(incompleteTasks.length === 0 && completedTasks.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FolderKanban className="w-12 h-12 text-gray-400 dark:text-zinc-600 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No tasks found
                                </h3>
                                <p className="text-gray-500 dark:text-zinc-400 mb-4 max-w-md">
                                    {filters.dueDate !== 'all' || filters.priority !== 'all' 
                                        ? 'No tasks match your current filters' 
                                        : 'Get started by creating your first task for this project'}
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 font-bold px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <BadgePlus className="w-4 h-4" />
                                    Add First Task
                                </button>
                            </div>
                        ) : (
                            <>
                                {incompleteTasks.length > 0 && (
                                    <>
                                        <h1 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                                            {incompleteTasks.length} {filters.dueDate !== 'all' || filters.priority !== 'all' ? 'Filtered' : ''} Tasks
                                        </h1>
                                        <motion.ul
                                            className="space-y-4 mb-8"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            key={`${project._id}-incomplete-tasks-${filters.dueDate}-${filters.priority}`}
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
                                {completedTasks.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            You have Completed {completedTasks.length} {filters.dueDate !== 'all' || filters.priority !== 'all' ? 'Filtered' : ''} Tasks!
                                        </h2>
                                        <motion.ul
                                            className="space-y-4 opacity-70"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            key={`${project._id}-completed-tasks-${filters.dueDate}-${filters.priority}`}
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