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
     * This operation *does* benefit from a full re-fetch because a new task
     * receives a server-generated ID and might affect parent subtask counts.
     * However, we can still provide optimistic feedback first.
     * @param {object} taskData - The data for the new task.
     */
    const handleCreateTask = async (taskData) => {
        if (!project || !project._id || !token) {
            toast.error('Project or authentication not ready. Cannot create task.');
            return false;
        }

        const tempId = `temp-${Date.now()}`; // Assign a temporary ID for optimistic rendering
        // Create an optimistic version of the new task, including fields expected from server
        const optimisticTask = {
            _id: tempId,
            projectId: project._id,
            isCompleted: false, // Default completion status
            createdAt: new Date().toISOString(), // Client-side timestamp
            updatedAt: new Date().toISOString(), // Client-side timestamp
            subtaskCount: 0, // Assume 0 subtasks initially
            ...taskData,
        };

        // Optimistically add the new task to the UI
        setTasks(prevTasks => [optimisticTask, ...prevTasks]);
        toast.promise(
            axios.post(`${API_URL}/tasks`, { ...taskData, projectId: project._id }, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    // Replace the optimistic task with the real one from the server
                    setTasks(prevTasks => prevTasks.map(t => t._id === tempId ? res.data : t));
                    // After successful creation, a re-fetch is still the safest bet
                    // to ensure all related counts (e.g., parent's subtaskCount) are accurate.
                    // fetchProjectTasks();
                    return 'Task added!';
                }),
            {
                loading: 'Adding task...',
                success: (message) => message,
                error: (err) => {
                    console.error('Failed to create task:', err);
                    // On error, revert the optimistic addition
                    setTasks(prevTasks => prevTasks.filter(t => t._id !== tempId));
                    // fetchProjectTasks(); // Fallback re-fetch to ensure consistency
                    return err.response?.data?.message || 'Failed to create task.';
                },
            }
        );
        return true; // Return true as optimistic update is in progress
    };

    /**
     * Toggles the completion status of a task.
     * This operation often affects derived properties like "completed subtask count"
     * on parent tasks, thus a re-fetch is justified after the optimistic update.
     * @param {object} task - The task object to toggle.
     */
    const toggleComplete = async (task) => {
        if (!token) {
            toast.error('Authentication required to update task.');
            return;
        }

        const originalIsCompleted = task.isCompleted;
        const nextIsCompleted = !originalIsCompleted;

        // Optimistic update for immediate visual feedback
        setTasks(prev =>
            prev.map(t => (t._id === task._id ? { ...t, isCompleted: nextIsCompleted } : t))
        );

        try {
            const endpoint = nextIsCompleted ? 'complete' : 'uncomplete';
            const { data } = await axios.patch(
                `${API_URL}/tasks/${task._id}/${endpoint}`,
                {}, // Empty body for PATCH /complete or /uncomplete
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // A re-fetch is still recommended here because toggling completion
            // of a subtask might change the completion status of its parent task,
            // or modify 'completedSubtaskCount' which is a derived property.
            // await fetchProjectTasks();
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
            // Skip _id and any other keys that should not be updated via PUT/PATCH,
            // including 'subtaskCount' as it's a derived property.
            if (key === '_id' || key === 'projectId' || key === 'ownerId' || key === '__v' || key === 'createdAt' || key === 'updatedAt' || key === 'subtaskCount') continue;
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
     * This method prioritizes maintaining UI fluidity for edits that *don't*
     * change the list's structure or fundamentally alter derived properties
     * like subtask counts that are tied to relationships.
     * @param {object} updatedTaskFromModal - The updated task object from the modal.
     */
    const handleUpdateTask = async (updatedTaskFromModal) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            toast.error('Authentication required to update task.');
            return false;
        }

        const currentTaskInState = tasks.find(t => t._id === updatedTaskFromModal._id);
        if (!currentTaskInState) {
            toast.error('Task not found in UI state.');
            return false;
        }

        const payloadToSend = diffTask(currentTaskInState, updatedTaskFromModal);

        // Ensure isCompleted is always included in payload if it changed or not
        // as it might be explicitly set in the modal
        if (payloadToSend.isCompleted === undefined) {
            payloadToSend.isCompleted = currentTaskInState.isCompleted;
        }

        if (Object.keys(payloadToSend).length === 0) {
            toast('Nothing to update.');
            return true;
        }

        // Optimistic update: Merge the updated fields but crucially *keep*
        // subtaskCount from currentTaskInState, as the backend PUT might not return it.
        const originalTasks = tasks; // Store for rollback
        const optimisticTask = {
            ...currentTaskInState, // Start with the current state (includes subtaskCount)
            ...payloadToSend,      // Apply only the explicitly changed fields
        };

        setTasks(prev =>
            prev.map(t => (t._id === currentTaskInState._id ? optimisticTask : t))
        );

        try {
            // Make the API call with only the changed fields
            await axios.put(
                `${API_URL}/tasks/${currentTaskInState._id}`,
                payloadToSend,
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );

            // Crucial: We DO NOT fetchProjectTasks here for typical edits (content, due date, priority).
            // The optimistic update handles the UI transition smoothly.
            // If the backend PUT *does* return an updated subtaskCount, you could merge it here,
            // but generally, simple edits don't affect subtask counts.
            toast.success('Task updated!');
            return true;
        } catch (err) {
            console.error('useProjectTasks: Failed to update task:', err);
            toast.error(err.response?.data?.message || 'Failed to update task.');
            // Rollback optimistic update on failure
            setTasks(originalTasks);
            fetchProjectTasks(); // Fallback hard refresh to ensure consistency
            return false;
        }
    };

    /**
     * Executes the task deletion after confirmation.
     * This operation inherently changes the list structure and might affect
     * parent subtask counts, making a re-fetch beneficial.
     * @param {string} taskId - The ID of the task to delete.
     */
    const handleDeleteTaskConfirmed = async (taskId) => {
        if (!token) {
            toast.error('Authentication required to delete task.');
            return false;
        }

        // Optimistic update: Remove the task immediately from the UI
        const originalTasks = tasks; // Store for rollback
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));

        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Task deleted!");
            // After deletion, re-fetch to ensure any potential parent tasks' subtask counts are updated
            // await fetchProjectTasks(); // Re-fetch for full accuracy and derived properties
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