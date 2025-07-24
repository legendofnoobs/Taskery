/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FolderKanban, Plus, ArrowLeft, BadgePlus } from 'lucide-react';
import TaskCard from '../../components/common/TaskCard'; // Reusing TaskCard
import CreateTaskModal from '../../components/common/CreateTaskModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import TaskDetailsModal from '../../components/common/TaskDetailsModal';

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

    const token = localStorage.getItem('token');

    const fetchProjectTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }
            const res = await axios.get(`${API_URL}/tasks/project/${project._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (err) {
            console.error(`Failed to fetch tasks for project ${project.name}:`, err);
            setError(`Failed to fetch tasks for ${project.name}.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (project && project._id) {
            fetchProjectTasks();
        }
    }, [project, token]);

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

    const handleCreateTask = async (taskData) => {
        try {
            await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                projectId: project._id, // Assign to the current project
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            fetchProjectTasks(); // Re-fetch tasks after creation
        } catch (err) {
            console.error('Failed to create task:', err);
            setError(err.response?.data?.message || 'Failed to create task.');
        }
    };

    const toggleComplete = async (task) => {
        try {
            const endpoint = task.isCompleted ? 'uncomplete' : 'complete';
            const res = await axios.patch(`${API_URL}/tasks/${task._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistically update the task's completion status in the local state
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? res.data : t))
            );
            fetchProjectTasks(); // Re-fetch to ensure consistency
        } catch (err) {
            console.error(`Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`, err);
            setError(err.response?.data?.message || `Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`);
        }
    };

    const handleUpdateTask = (updated) => {
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
        fetchProjectTasks(); // Re-fetch to ensure consistency
    };

    const confirmDelete = (task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
        setOpenDropdownId(null);
    };

    const handleDeleteTaskConfirmed = async () => {
        if (!taskToDelete) return;

        try {
            await axios.delete(`${API_URL}/tasks/${taskToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
            setShowDeleteModal(false);
            setTaskToDelete(null);
            fetchProjectTasks(); // Re-fetch to ensure consistency
        } catch (err) {
            console.error('Failed to delete task:', err);
            setError(err.response?.data?.message || 'Failed to delete task.');
            setShowDeleteModal(false);
            setTaskToDelete(null);
        }
    };

    const handleViewDetails = (task) => {
        setViewingTask(task);
        setShowDetailsModal(true);
        setOpenDropdownId(null);
    };

    if (!project) {
        return <div className="md:ml-72 mt-8 px-4 py-6 text-red-500">Project not found.</div>;
    }

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <button onClick={onBackToProjects} className="p-1 rounded-full hover:bg-gray-200 transition-colors mr-2" aria-label="Back to Projects">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <FolderKanban className="w-6 h-6" /> {project.name} Tasks
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
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
                <div className="text-gray-400 italic">No tasks in this project.</div>
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
