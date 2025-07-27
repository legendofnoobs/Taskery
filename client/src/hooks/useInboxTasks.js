// src/hooks/useInboxTasks.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import useFavoriteProjects from './useFavoriteProjects';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook to manage tasks for the Inbox page, including fetching,
 * CRUD operations, and filtering based on due date and priority.
 *
 * @param {string} filterDueDate - Filter for task due date ('all', 'today', 'tomorrow', 'this_week', 'overdue').
 * @param {string} filterPriority - Filter for task priority ('all', 'none', 'low', 'medium', 'high').
 */
export const useInboxTasks = (filterDueDate = 'all', filterPriority = 'all') => {
    const { user } = useAuth();
    const { refetchProjects: refetchSidebarFavorites } = useFavoriteProjects();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inboxProjectId, setInboxProjectId] = useState(null);
    const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Memoized function to fetch the Inbox project ID
    const fetchAndSetInboxProjectId = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (!user || !currentToken) {
            setInboxProjectId(null);
            setTasks([]);
            setLoading(false);
            setError(null);
            setSelectedTaskForDetails(null);
            console.log("useInboxTasks: No user or token, clearing state.");
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            const inboxProject = res.data.find(project => project.isInbox);
            if (inboxProject) {
                setInboxProjectId(inboxProject._id);
                console.log("useInboxTasks: Inbox Project ID fetched:", inboxProject._id);
            } else {
                setError('Inbox project not found for the current user.');
                setInboxProjectId(null);
                console.error("useInboxTasks: Inbox project not found.");
            }
        } catch (err) {
            console.error('useInboxTasks: Failed to fetch inbox project ID:', err);
            setError(err.response?.data?.message || 'Failed to load inbox project ID.');
            setInboxProjectId(null);
        }
    }, [user]);

    // Memoized function to fetch tasks based on the Inbox project ID and filters
    const fetchTasksForInbox = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (!inboxProjectId || !currentToken) {
            console.log("useInboxTasks: Cannot fetch tasks - missing inboxProjectId or token.");
            setTasks([]);
            setLoading(false);
            setSelectedTaskForDetails(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams(location.search);
            const taskIdFromUrl = queryParams.get('taskId');

            if (taskIdFromUrl) {
                // If a taskId is in the URL, fetch that specific task for details
                const res = await axios.get(`${API_URL}/tasks/${taskIdFromUrl}`, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
                setSelectedTaskForDetails(res.data);
                setTasks([]); // Clear general tasks list when viewing a single task's details
            } else {
                // Otherwise, fetch all tasks for the main list based on filters
                const params = new URLSearchParams();
                if (filterDueDate !== 'all') {
                    params.append('dueDate', filterDueDate);
                }
                if (filterPriority !== 'all') {
                    params.append('priority', filterPriority);
                }

                const requestUrl = `${API_URL}/tasks/project/${inboxProjectId}?${params.toString()}`;
                console.log("useInboxTasks: Fetching tasks from:", requestUrl);
                console.log("useInboxTasks: Filters applied - DueDate:", filterDueDate, "Priority:", filterPriority);

                const res = await axios.get(requestUrl, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
                setTasks(res.data);
                setSelectedTaskForDetails(null); // Reset selected task for details
                console.log("useInboxTasks: Tasks fetched successfully:", res.data.length, "tasks.");
            }
        } catch (err) {
            console.error('useInboxTasks: Failed to fetch tasks:', err);
            setError(err.response?.data?.message || 'Failed to load tasks.');
            setTasks([]);
            setSelectedTaskForDetails(null);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inboxProjectId, filterDueDate, filterPriority, user, location.search]);

    // Effect 1: Fetch Inbox Project ID when user changes
    useEffect(() => {
        fetchAndSetInboxProjectId();
    }, [fetchAndSetInboxProjectId]);

    // Effect 2: Fetch tasks when Inbox Project ID or filters or URL params change
    useEffect(() => {
        if (inboxProjectId || location.search.includes('taskId=')) {
            fetchTasksForInbox();
        }
    }, [inboxProjectId, fetchTasksForInbox, location.search]);


    /**
     * Helper function to find differences between two task objects.
     * This is for generating the *payload to send to the backend*, so derived fields
     * that shouldn't be sent (like subtaskCount) are correctly omitted.
     * @param {object} original - The original task object from state.
     * @param {object} next - The new task object from the modal (user input).
     * @returns {object} - An object containing only the changed fields relevant for backend update.
     */
    function diffTask(original, next) {
        const payload = {};
        for (const key of Object.keys(next)) {
            // Fields that are either backend-managed or derived and should NOT be sent in the payload
            if (key === '_id' || key === 'projectId' || key === 'ownerId' || key === '__v' || key === 'createdAt' || key === 'updatedAt' || key === 'subtaskCount') {
                continue;
            }
            // Special handling for dates (compare ISO strings, and ensure they are dates)
            if (next[key] instanceof Date && original[key] instanceof Date) {
                if (next[key].toISOString() !== original[key].toISOString()) {
                    payload[key] = next[key];
                }
            }
            // Deep comparison for arrays (like tags) and general objects using JSON.stringify
            else if (JSON.stringify(original[key]) !== JSON.stringify(next[key])) {
                payload[key] = next[key];
            }
        }
        return payload;
    }

    /**
     * Handles the creation of a new task for the Inbox.
     * Includes optimistic update and subsequent re-fetch for accuracy.
     * @param {object} taskData - The data for the new task.
     */
    const handleCreateTask = async (taskData) => {
        const currentToken = localStorage.getItem('token');
        if (!inboxProjectId || !currentToken) {
            toast.error('Inbox not ready. Cannot create task.');
            return false;
        }

        const tempId = `temp-${Date.now()}`;
        const optimisticTask = {
            _id: tempId,
            projectId: inboxProjectId, // Assign to inbox project
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subtaskCount: 0, // Assuming new inbox tasks start with 0 subtasks
            ...taskData,
        };

        // Optimistically add the new task to the TOP of the list
        setTasks(prevTasks => [optimisticTask, ...prevTasks]);

        // Use toast.promise for integrated loading/success/error feedback
        toast.promise(
            axios.post(`${API_URL}/tasks`, { ...taskData, projectId: inboxProjectId }, {
                headers: { Authorization: `Bearer ${currentToken}` }
            })
                .then(res => {
                    // Replace the optimistic task with the real one from the server
                    // This ensures we get the actual _id and server-generated timestamps/defaults
                    setTasks(prevTasks => prevTasks.map(t => (t._id === tempId ? res.data : t)));
                    refetchSidebarFavorites(); // Potentially update sidebar counts if projects are affected
                    // A full re-fetch is still often best for creation to ensure all derived properties
                    // are accurate and filters are correctly applied to the new task.
                    // fetchTasksForInbox();
                    return 'Task added!';
                }),
            {
                loading: 'Adding task...',
                success: (message) => message,
                error: (err) => {
                    console.error('Failed to create task:', err);
                    // On error, revert the optimistic addition
                    setTasks(prevTasks => prevTasks.filter(t => t._id !== tempId));
                    fetchTasksForInbox(); // Fallback re-fetch for consistency
                    return err.response?.data?.message || 'Failed to create task.';
                },
            }
        );
        return true; // Return true as optimistic update is in progress
    };

    /**
     * Toggles the completion status of a task.
     * Applies optimistic update and then syncs with server. Does a re-fetch on error.
     * @param {object} task - The task object to toggle.
     */
    const toggleComplete = async (task) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
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
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );

            // A re-fetch is still recommended here because toggling completion
            // of a subtask might change the completion status of its parent task,
            // or modify 'completedSubtaskCount' which is a derived property.
            // await fetchProjectTasks();
            toast.success(`Task marked as ${data.isCompleted ? 'completed' : 'incomplete'}!`);
        } catch (err) {
            console.error('Failed to toggle task completion:', err);
            toast.error(err.response?.data?.message || 'Failed to update task completion.');
            // Revert optimistic update on failure
            setTasks(prevTasks =>
                prevTasks.map(t => (t._id === task._id ? { ...t, isCompleted: originalIsCompleted } : t))
            );
            if (selectedTaskForDetails && selectedTaskForDetails._id === task._id) {
                setSelectedTaskForDetails(prev => ({ ...prev, isCompleted: originalIsCompleted }));
            }
            fetchTasksForInbox(); // Fallback hard refresh on error to ensure consistency
        }
    };

    /**
     * Handles the update of an existing task.
     * Prioritizes seamless UI updates by only modifying the relevant task in state.
     * @param {object} updatedTaskFromModal - The updated task object from the modal.
     */
    const handleUpdateTask = async (updatedTaskFromModal) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            toast.error('Authentication required to update task.');
            return false;
        }

        const currentTaskInState = tasks.find(t => t._id === updatedTaskFromModal._id) || selectedTaskForDetails;
        if (!currentTaskInState) {
            toast.error('Task not found in UI state.');
            return false;
        }

        // Use diffTask to determine what actually changed for the API payload
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

        // Store original states for rollback
        const originalTasks = tasks;
        const originalSelectedTask = selectedTaskForDetails;

        // Optimistic update: Create the optimistic task by merging updated fields
        // into the *current* task state, thereby preserving all existing properties
        // including derived ones like subtaskCount.
        const optimisticTask = { ...currentTaskInState, ...updatedTaskFromModal };

        setTasks(prev =>
            prev.map(t => (t._id === currentTaskInState._id ? optimisticTask : t))
        );

        try {
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
            console.error('Failed to update task:', err);
            toast.error(err.response?.data?.message || 'Failed to update task.');
            // Rollback optimistic update on failure
            setTasks(originalTasks);
            setSelectedTaskForDetails(originalSelectedTask);
            fetchTasksForInbox(); // Fallback hard refresh to ensure consistency
            return false;
        }
    };

    /**
     * Executes the task deletion.
     * Includes optimistic removal and subsequent re-fetch for accuracy.
     * @param {string} taskId - The ID of the task to delete.
     */
    const handleDeleteTaskConfirmed = async (taskId) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            toast.error('Authentication required to delete task.');
            return false;
        }

        // Optimistic update (store original for rollback)
        const originalTasks = tasks;
        // const originalSelectedTask = selectedTaskForDetails;

        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
        // if (selectedTaskForDetails && selectedTaskForDetails._id === taskId) {
        //     setSelectedTaskForDetails(null); // Clear selected task if it's the one being deleted
        //     navigate('/dashboard/inbox', { replace: true }); // Go back to inbox list
        // }

        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            toast.success("Task deleted!");
            // A re-fetch is often needed after deletion to re-evaluate filters,
            // or if the deleted task was a subtask in a project affecting a parent's count.
            // fetchTasksForInbox();
            return true;
        } catch (err) {
            console.error('Failed to delete task:', err);
            toast.error(err.response?.data?.message || 'Failed to delete task.');
            // Revert optimistic update on failure
            setTasks(originalTasks);
            // setSelectedTaskForDetails(originalTasks);
            fetchTasksForInbox(); // Fallback re-fetch
            return false;
        }
    };

    /**
     * Handler for clicking a task card to view its details page.
     * Updates the URL and sets the selected task for detail view.
     */
    const handleTaskCardClick = (task) => {
        setSelectedTaskForDetails(task);
        navigate(`/dashboard/inbox?taskId=${task._id}`); // Update URL
    };

    /**
     * Handler to go back to the inbox tasks list from a task detail view.
     */
    const handleBackToInbox = () => {
        setSelectedTaskForDetails(null);
        navigate('/dashboard/inbox', { replace: true }); // Clear taskId from URL
    };

    return {
        tasks,
        loading,
        error,
        selectedProjectId: inboxProjectId,
        selectedTaskForDetails,
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
        handleTaskCardClick,
        handleBackToInbox,
        refetchTasks: fetchTasksForInbox // Expose for manual re-fetching if needed (e.g., filter changes)
    };
};