import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Circle, Tag, PlusCircle, Loader2, Edit, Trash2, BadgePlus, ListTree } from 'lucide-react'; // Import ListTree
import CreateTaskModal from '../common/CreateTaskModal';
import TaskCard from '../common/TaskCard';
import EditTaskModal from '../common/EditTaskModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Renamed prop for clarity: onBackToProjects to match ProjectTasksPage
const TaskDetailsPage = ({ task, onBackToInbox, onTaskUpdated, onTaskDeleted }) => {
    const [subtasks, setSubtasks] = useState([]);
    const [loadingSubtasks, setLoadingSubtasks] = useState(true);
    const [subtaskError, setSubtaskError] = useState(null);
    const [isCreateSubtaskModalOpen, setIsCreateSubtaskModalOpen] = useState(false);
    const [subtaskCompletionPercentage, setSubtaskCompletionPercentage] = useState(0);
    const [loadingCompletion, setLoadingCompletion] = useState(true);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // New states for managing subtask modals
    const [isEditSubtaskModalOpen, setIsEditSubtaskModalOpen] = useState(false);
    const [editingSubtask, setEditingSubtask] = useState(null); // Stores the subtask being edited

    const [isDeleteSubtaskModal, setIsDeleteSubtaskModal ]= useState(false);
    const [deletingSubtask, setDeletingSubtask] = useState(null); // Stores the subtask being deleted

    const [openSubtaskDropdownId, setOpenSubtaskDropdownId] = useState(null);
    const subtaskDropdownRef = useRef(null);

    // Close dropdown if clicked outside
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
    }, [subtaskDropdownRef]);

    // Fetch subtasks and their completion percentage when the task prop changes
    useEffect(() => {
        if (task?._id) {
            fetchSubtasks(task._id);
            fetchSubtaskCompletionPercentage(task._id);
        }
    }, [task?._id]);

    const fetchSubtasks = async (parentId) => {
        setLoadingSubtasks(true);
        setSubtaskError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/tasks/subtasks/${parentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubtasks(response.data);
        } catch (err) {
            console.error('Failed to fetch subtasks:', err);
            setSubtaskError('Failed to load subtasks.');
        } finally {
            setLoadingSubtasks(false);
        }
    };

    const fetchSubtaskCompletionPercentage = async (parentId) => {
        setLoadingCompletion(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/tasks/completion/${parentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubtaskCompletionPercentage(response.data.percentage);
        } catch (err) {
            console.error('Failed to fetch subtask completion percentage:', err);
        } finally {
            setLoadingCompletion(false);
        }
    };

    const handleSubtaskCreated = async (newSubtaskData) => {
        try {
            const token = localStorage.getItem('token');
            const taskDataWithParent = { ...newSubtaskData, parentId: task._id };
            const res = await axios.post(`${API_URL}/tasks`, taskDataWithParent, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubtasks((prev) => [...prev, res.data]);
            fetchSubtaskCompletionPercentage(task._id);
            setIsCreateSubtaskModalOpen(false); // Close the modal on success
        } catch (err) {
            console.error('Error creating subtask:', err.response?.data?.message || err.message);
            alert('Failed to create subtask: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleToggleSubtaskComplete = async (subtaskToToggle, isCompleted) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = isCompleted ? 'complete' : 'uncomplete';
            await axios.patch(`${API_URL}/tasks/${subtaskToToggle._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubtasks((prev) =>
                prev.map((sub) =>
                    sub._id === subtaskToToggle._id ? { ...sub, isCompleted: isCompleted } : sub
                )
            );
            fetchSubtaskCompletionPercentage(task._id);
        } catch (err) {
            console.error(`Error ${isCompleted ? 'completing' : 'uncompleting'} subtask:`, err);
            alert(`Failed to ${isCompleted ? 'complete' : 'uncomplete'} subtask.`);
        }
    };

    // New handler for opening subtask edit modal
    const handleEditSubtask = (subtaskToEdit) => {
        setEditingSubtask(subtaskToEdit);
        setIsEditSubtaskModalOpen(true);
        setOpenSubtaskDropdownId(null); // Close dropdown
    };

    // New handler for when a subtask is updated via modal
    const handleSubtaskUpdated = (updatedSubtask) => {
        setSubtasks((prev) =>
            prev.map((sub) => (sub._id === updatedSubtask._id ? updatedSubtask : sub))
        );
        setIsEditSubtaskModalOpen(false);
        setEditingSubtask(null);
    };

    // New handler for opening subtask delete confirmation modal
    const handleConfirmDeleteSubtask = (subtaskToDelete) => {
        setDeletingSubtask(subtaskToDelete);
        setIsDeleteSubtaskModal(true);
        setOpenSubtaskDropdownId(null); // Close dropdown
    };

    // New handler for actual subtask deletion
    const handleDeleteSubtask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/tasks/${deletingSubtask._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubtasks((prev) => prev.filter((sub) => sub._id !== deletingSubtask._id));
            fetchSubtaskCompletionPercentage(task._id);
            setIsDeleteSubtaskModal(false);
            setDeletingSubtask(null);
        } catch (err) {
            console.error('Error deleting subtask:', err);
            alert('Failed to delete subtask.');
            setIsDeleteSubtaskModal(false);
            setDeletingSubtask(null);
        }
    };

    const handleEditMainTask = () => {
        setIsEditTaskModalOpen(true);
    };

    const handleMainTaskUpdated = (updatedTask) => {
        // This task prop should already be the latest from ProjectTasksPage
        // No need to update the local task state as it's passed down
        onTaskUpdated(updatedTask); // Notify parent component to update the task
        setIsEditTaskModalOpen(false);
    };

    const handleConfirmDeleteMainTask = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteMainTask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/tasks/${task._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onTaskDeleted(task._id); // Notify parent component
            setIsDeleteModalOpen(false);
            // onBackToInbox(); // This will be handled by the parent's onTaskDeleted
        } catch (err) {
            console.error('Error deleting task:', err);
            alert('Failed to delete task.');
            setIsDeleteModalOpen(false);
        }
    };


    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'text-blue-500';
            case 2: return 'text-green-500';
            case 3: return 'text-yellow-500';
            case 4: return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
            case 4: return 'Urgent';
            default: return 'None';
        }
    };

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
                <div className="flex gap-2"> {/* Container for buttons */}
                    {/* Edit Task Button */}
                    <button
                        onClick={handleEditMainTask}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                        aria-label="Edit Task"
                    >
                        <Edit className="w-4 h-4" /> Edit
                    </button>
                    {/* Delete Task Button */}
                    <button
                        onClick={handleConfirmDeleteMainTask}
                        className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 bg-red-500 hover:bg-red-600 text-white transition-colors text-sm"
                        aria-label="Delete Task"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            <div className="pt-10 pb-18">
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

                    {loadingSubtasks ? (
                        <div className="text-center text-gray-500 dark:text-zinc-400 py-4">
                            <Loader2 className="animate-spin inline-block mr-2" /> Loading subtasks...
                        </div>
                    ) : subtaskError ? (
                        <p className="text-red-600 text-center py-4">{subtaskError}</p>
                    ) : subtasks.length === 0 ? (
                        <p className="text-gray-500 dark:text-zinc-400 text-center py-4">No subtasks for this task yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {subtasks.map((subtask) => (
                                <TaskCard
                                    key={subtask._id}
                                    task={subtask}
                                    onToggleComplete={() => handleToggleSubtaskComplete(subtask, !subtask.isCompleted)}
                                    onEditTask={handleEditSubtask}
                                    onConfirmDelete={handleConfirmDeleteSubtask}
                                    onViewDetails={null}
                                    openDropdownId={openSubtaskDropdownId}
                                    setOpenDropdownId={setOpenSubtaskDropdownId}
                                    dropdownRef={subtaskDropdownRef}
                                    isSubtask={true}
                                    onClick={null}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Create Subtask Modal */}
            <CreateTaskModal
                isOpen={isCreateSubtaskModalOpen}
                onClose={() => setIsCreateSubtaskModalOpen(false)}
                onTaskCreated={handleSubtaskCreated}
                defaultProjectId={task.projectId}
                defaultDueDate={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
            />

            {/* Edit Main Task Modal */}
            <EditTaskModal
                isOpen={isEditTaskModalOpen}
                onClose={() => setIsEditTaskModalOpen(false)}
                task={task}
                onUpdate={handleMainTaskUpdated}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteMainTask}
                title="Delete Task"
                message={`Are you sure you want to delete the task: "${task.content}"? This action cannot be undone.`}
            />
            {editingSubtask && (
                <EditTaskModal
                    isOpen={isEditSubtaskModalOpen}
                    onClose={() => { setIsEditSubtaskModalOpen(false); setEditingSubtask(null); }}
                    task={editingSubtask}
                    onUpdate={handleSubtaskUpdated}
                />
            )}
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