// src/hooks/useProjectTasks.js

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook to manage tasks for a specific project.
 * It provides fetching, and CRUD operations with optimistic updates.
 *
 * @param {object} project - The project object for which tasks are managed.
 */
export const useProjectTasks = (project) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    /**
     * Fetches tasks specifically for the current project, where parentId is null.
     * Memoized with useCallback to prevent unnecessary re-creations.
     */
    const fetchProjectTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                setTasks([]); // Clear tasks if not authenticated
                return;
            }
            if (!project || !project._id) {
                setError('Project information is missing.');
                setLoading(false);
                setTasks([]); // Clear tasks if project info is missing
                return;
            }

            console.log(`useProjectTasks: Fetching top-level tasks for project ID: ${project._id}`);
            // MODIFICATION HERE: Add a query parameter or use a specific endpoint
            // This assumes your backend has an endpoint like /api/tasks/project/:projectId?parentId=null
            // Or you might need a dedicated endpoint like /api/tasks/project/:projectId/top-level
            const res = await axios.get(`${API_URL}/tasks/project/${project._id}?parentId=null`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
            console.log(`useProjectTasks: Top-level tasks fetched successfully for project ${project.name || 'N/A'}:`, res.data.length, "tasks.");
        } catch (err) {
            console.error(`useProjectTasks: Failed to fetch top-level tasks for project ${project?.name || 'N/A'}:`, err);
            setError(err.response?.data?.message || `Failed to fetch tasks for ${project?.name || 'this project'}.`);
            setTasks([]); // Clear tasks on error
        } finally {
            setLoading(false);
        }
    }, [project, token]); // Depend on project (for _id and name) and token

    // Fetch tasks when the project or token changes
    useEffect(() => {
        if (project && project._id) {
            fetchProjectTasks();
        }
    }, [project, fetchProjectTasks]); // Depend on project and the memoized fetchProjectTasks

    /**
     * Handles the creation of a new task for the current project.
     * Includes optimistic update.
     * @param {object} taskData - The data for the new task.
     */
    const handleCreateTask = async (taskData) => {
        if (!project || !project._id || !token) {
            toast.error('Project or authentication not ready. Cannot create task.');
            return false;
        }
        try {
            const res = await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                projectId: project._id, // Assign to the current project
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistically add the new task to the TOP of the state
            setTasks(prevTasks => [res.data, ...prevTasks]); // <-- CHANGED HERE
            toast.success('Added Task!');
            // Removed fetchProjectTasks() here to enable seamless optimistic update
            return true;
        } catch (err) {
            console.error('Failed to create task:', err);
            toast.error(err.response?.data?.message || 'Failed to create task.');
            fetchProjectTasks(); // Fallback re-fetch on error
            return false;
        }
    };

    /**
     * Toggles the completion status of a task.
     * Includes optimistic update and server sync.
     * @param {object} task - The task object to toggle.
     */
    const toggleComplete = async (task) => {
        if (!token) {
            toast.error('Authentication required to update task.');
            return;
        }

        console.log("toggleComplete (ProjectTasks): Task object received:", task);
        const originalIsCompleted = task.isCompleted;
        const nextIsCompleted = !originalIsCompleted;
        console.log(`toggleComplete (ProjectTasks): Original: ${originalIsCompleted}, New: ${nextIsCompleted}`);

        // Optimistic update
        setTasks(prev =>
            prev.map(t => (t._id === task._id ? { ...t, isCompleted: nextIsCompleted } : t))
        );

        try {
            const endpoint = nextIsCompleted ? 'complete' : 'uncomplete';
            console.log(`toggleComplete (ProjectTasks): Sending PATCH to ${API_URL}/tasks/${task._id}/${endpoint}`);
            const { data } = await axios.patch(
                `${API_URL}/tasks/${task._id}/${endpoint}`,
                {}, // Empty body for PATCH /complete or /uncomplete
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Sync with server response just in case backend modified anything else
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? data : t))
            );

            toast.success(`Task marked as ${data.isCompleted ? 'completed' : 'incomplete'}!`);
        } catch (err) {
            console.error('useProjectTasks: Failed to toggle task completion:', err);
            toast.error(err.response?.data?.message || 'Failed to update task completion.');
            // Revert optimistic update on failure
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? { ...t, isCompleted: originalIsCompleted } : t))
            );
            fetchProjectTasks(); // Fallback hard refresh
        }
    };

    /**
     * Helper function to find differences between two task objects.
     * Used to send only changed fields to the backend.
     * @param {object} original - The original task object from state.
     * @param {object} next - The new task object from the modal.
     * @returns {object} - An object containing only the changed fields.
     */
    function diffTask(original, next) {
        const payload = {};
        for (const key of Object.keys(next)) {
            // Skip _id and any other keys that should not be updated via PUT
            if (key === '_id' || key === 'projectId' || key === 'ownerId' || key === '__v' || key === 'createdAt' || key === 'updatedAt') continue;
            // Compare values, ensuring date objects are compared by their string representation
            if (original[key] instanceof Date && next[key] instanceof Date) {
                if (original[key].toISOString() !== next[key].toISOString()) {
                    payload[key] = next[key];
                }
            } else if (JSON.stringify(original[key]) !== JSON.stringify(next[key])) { // Deep comparison for arrays (tags)
                payload[key] = next[key];
            }
        }
        return payload;
    }

    /**
     * Handles the update of an existing task.
     * Includes optimistic update and server sync.
     * @param {object} updatedTaskFromModal - The updated task object from the modal.
     */
    const handleUpdateTask = async (updatedTaskFromModal) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            toast.error('Authentication required to update task.');
            return false;
        }

        console.log("handleUpdateTask (ProjectTasks): Incoming updatedTask from modal:", updatedTaskFromModal);

        // 1) Find the current task in state to get its original `isCompleted` status
        const currentTaskInState = tasks.find(t => t._id === updatedTaskFromModal._id);
        if (!currentTaskInState) {
            toast.error('Task not found in UI state.');
            return false;
        }

        // 2) Build the payload (send only what changed)
        const payloadToSend = diffTask(currentTaskInState, updatedTaskFromModal);

        // Ensure `isCompleted` is always explicitly included in the payloadToSend
        // If the modal didn't send it, preserve the current state's value.
        // If the modal did send it, use the modal's value.
        if (payloadToSend.isCompleted === undefined) {
            payloadToSend.isCompleted = currentTaskInState.isCompleted;
        }

        // If nothing changed (after considering `isCompleted` explicitly), just close modal
        if (Object.keys(payloadToSend).length === 0) {
            toast('Nothing to update.');
            return true;
        }

        // 3) Optimistic update
        const originalTasks = tasks; // Store for rollback
        const optimisticTask = { ...currentTaskInState, ...payloadToSend }; // Merge current state with changes

        setTasks(prev =>
            prev.map(t => (t._id === currentTaskInState._id ? optimisticTask : t))
        );

        try {
            // 4) Call API with the carefully constructed payload
            console.log("handleUpdateTask (ProjectTasks): Sending payload to backend (PUT /tasks/:id):", payloadToSend);
            const { data: savedTask } = await axios.put(
                `${API_URL}/tasks/${currentTaskInState._id}`,
                payloadToSend, // Send only the changed fields, including explicit isCompleted
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );

            // 5) Sync with server response (just in case backend modified anything)
            setTasks(prev =>
                prev.map(t => (t._id === currentTaskInState._id ? savedTask : t))
            );

            toast.success('Task updated!');
            // Removed fetchProjectTasks() here to enable seamless optimistic update
            return true;
        } catch (err) {
            console.error('useProjectTasks: Failed to update task:', err);
            toast.error(err.response?.data?.message || 'Failed to update task.');
            // Rollback optimistic update on failure
            setTasks(originalTasks);
            fetchProjectTasks(); // Fallback hard refresh
            return false;
        }
    };

    /**
     * Executes the task deletion after confirmation.
     * Includes optimistic update.
     * @param {string} taskId - The ID of the task to delete.
     */
    const handleDeleteTaskConfirmed = async (taskId) => {
        if (!token) {
            toast.error('Authentication required to delete task.');
            return false;
        }

        // Optimistic update (store original for rollback)
        const originalTasks = tasks;
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));

        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Task deleted!");
            // No need to re-fetch if optimistic update was successful and accurate
            // unless project task counts are displayed elsewhere and need updating.
            // For now, we rely on the filter to update the list.
            return true;
        } catch (err) {
            console.error('useProjectTasks: Failed to delete task:', err);
            toast.error(err.response?.data?.message || 'Failed to delete task.');
            // Revert optimistic update or re-fetch on failure
            setTasks(originalTasks); // Rollback
            fetchProjectTasks(); // Fallback re-fetch
            return false;
        }
    };

    return {
        tasks,
        loading,
        error,
        fetchProjectTasks, // Expose for manual re-fetching if needed
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
    };
};