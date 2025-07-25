// src/hooks/useProjectTasks.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useProjectTasks = (project) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, token]);

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
            fetchProjectTasks(); // Re-fetch tasks after creation
            return true;
        } catch (err) {
            console.error('Failed to create task:', err);
            setError(err.response?.data?.message || 'Failed to create task.');
            return false;
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
    const handleUpdateTask = async (updated) => {
        try {
            await axios.put(`${API_URL}/tasks/${updated._id}`, updated, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Updated Task!');
            fetchProjectTasks(); // Re-fetch to ensure consistency
            return true;
        } catch (err) {
            console.error('Failed to update task:', err);
            setError(err.response?.data?.message || 'Failed to update task.');
            return false;
        }
    };

    /**
     * Executes the task deletion after confirmation.
     */
    const handleDeleteTaskConfirmed = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Deleted Task!');
            fetchProjectTasks(); // Re-fetch to ensure consistency
            return true;
        } catch (err) {
            console.error('Failed to delete task:', err);
            setError(err.response?.data?.message || 'Failed to delete task.');
            return false;
        }
    };

    return {
        tasks,
        loading,
        error,
        fetchProjectTasks,
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
    };
};
