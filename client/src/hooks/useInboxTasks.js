// src/hooks/useInboxTasks.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useInboxTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const token = localStorage.getItem('token');

    // Function to fetch inbox tasks and set the selected project ID
    const fetchInboxTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
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

    // Initial fetch of inbox tasks on component mount or when token changes
    useEffect(() => {
        fetchInboxTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Handles the creation of a new task via API
    const handleCreateTask = async (taskData) => {
        if (!selectedProjectId) {
            toast.error('Inbox not ready to add tasks. Please wait or refresh.');
            return false; // Indicate failure
        }
        try {
            await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                projectId: selectedProjectId, // Ensure task is assigned to the inbox project
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Added Task!');
            fetchInboxTasks(); // Re-fetch tasks to update the list
            return true; // Indicate success
        } catch (err) {
            console.error('Failed to create task:', err);
            setError(err.response?.data?.message || 'Failed to create task.');
            return false;
        }
    };

    // Toggles the completion status of a task via API
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

    // Handles the update of an existing task via API
    const handleUpdateTask = async (updatedTask) => {
        try {
            await axios.put(`${API_URL}/tasks/${updatedTask._id}`, updatedTask, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Updated Task!');
            fetchInboxTasks(); // Re-fetch to ensure data consistency
            return true;
        } catch (err) {
            console.error('Failed to update task:', err);
            setError(err.response?.data?.message || 'Failed to update task.');
            return false;
        }
    };

    // Executes the task deletion via API
    const handleDeleteTaskConfirmed = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Deleted Task!');
            fetchInboxTasks(); // Re-fetch to ensure full consistency
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
        selectedProjectId,
        fetchInboxTasks,
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
    };
};
