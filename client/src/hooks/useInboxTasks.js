// src/hooks/useInboxTasks.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import useFavoriteProjects from './useFavoriteProjects';
import { useLocation, useNavigate } from 'react-router-dom'; // <--- NEW IMPORTS

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
    const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null); // <--- NEW STATE

    const location = useLocation(); // <--- NEW
    const navigate = useNavigate(); // <--- NEW

    // Memoized function to fetch the Inbox project ID
    const fetchAndSetInboxProjectId = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (!user || !currentToken) {
            setInboxProjectId(null);
            setTasks([]);
            setLoading(false);
            setError(null);
            setSelectedTaskForDetails(null); // <--- Clear selected task
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
            setSelectedTaskForDetails(null); // <--- Clear selected task
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams(location.search); // <--- NEW
            const taskIdFromUrl = queryParams.get('taskId'); // <--- NEW

            if (taskIdFromUrl) {
                // If a taskId is in the URL, fetch that specific task
                const res = await axios.get(`${API_URL}/tasks/${taskIdFromUrl}`, { // Assuming /tasks/:id endpoint
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
                setSelectedTaskForDetails(res.data);
                setTasks([]); // Clear general tasks list when viewing a single task's details
            } else {
                // Otherwise, fetch all tasks for the main list
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
            setSelectedTaskForDetails(null); // Reset selected task for details
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inboxProjectId, filterDueDate, filterPriority, user, location.search]); // Add location.search as a dependency

    // Effect 1: Fetch Inbox Project ID when user changes
    useEffect(() => {
        fetchAndSetInboxProjectId();
    }, [fetchAndSetInboxProjectId]);

    // Effect 2: Fetch tasks when Inbox Project ID or filters or URL params change
    useEffect(() => {
        if (inboxProjectId || location.search.includes('taskId=')) { // Ensure fetch happens if ID is set or taskId is in URL
            fetchTasksForInbox();
        }
    }, [inboxProjectId, fetchTasksForInbox, location.search]);


    // Handlers for task CRUD operations with seamless UI updates
    const handleCreateTask = async (taskData) => {
        const currentToken = localStorage.getItem('token');
        if (!inboxProjectId || !currentToken) {
            toast.error('Inbox not ready. Cannot create task.');
            return false;
        }
        try {
            const res = await axios.post(`${API_URL}/tasks`, { ...taskData, projectId: inboxProjectId }, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            // Optimistically add the new task to the TOP of the state
            setTasks(prevTasks => [res.data, ...prevTasks]);
            toast.success("Task created!");
            refetchSidebarFavorites();
            return true;
        } catch (err) {
            console.error('Failed to create task:', err);
            toast.error(err.response?.data?.message || 'Failed to create task.');
            fetchTasksForInbox(); // Fallback to re-fetch if optimistic update fails
            return false;
        }
    };

    const toggleComplete = async (task) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            toast.error('Authentication required to update task.');
            return;
        }

        const originalIsCompleted = task.isCompleted;
        const next = !originalIsCompleted;

        // optimistic update
        setTasks(prev =>
            prev.map(t => (t._id === task._id ? { ...t, isCompleted: next } : t))
        );

        try {
            const endpoint = next ? 'complete' : 'uncomplete';
            const { data } = await axios.patch(
                `${API_URL}/tasks/${task._id}/${endpoint}`,
                {},
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );

            // sync with server response just in case
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? data : t))
            );

            toast.success(`Task marked as ${data.isCompleted ? 'completed' : 'incomplete'}!`);
        } catch (err) {
            console.error('Failed to toggle task completion:', err);
            toast.error(err.response?.data?.message || 'Failed to update task completion.');
            // revert optimistic update
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? { ...t, isCompleted: originalIsCompleted } : t))
            );
            fetchTasksForInbox?.(); // only if you really need a hard refresh
        }
    };

    function diffTask(original, next) {
        const payload = {}
        for (const key of Object.keys(next)) {
            if (key === '_id') continue
            if (original[key] !== next[key]) {
                payload[key] = next[key]
            }
        }
        return payload
    }

    const handleUpdateTask = async (updatedTaskFromModal) => {
        const currentToken = localStorage.getItem('token')
        if (!currentToken) {
            toast.error('Authentication required to update task.')
            return false
        }

        const curr = tasks.find(t => t._id === updatedTaskFromModal._id) || selectedTaskForDetails; // <--- Check selectedTaskForDetails too
        if (!curr) {
            toast.error('Task not found in UI state.')
            return false
        }

        const payload = diffTask(curr, updatedTaskFromModal)

        if (payload.isCompleted === undefined) {
            payload.isCompleted = curr.isCompleted
        }

        if (Object.keys(payload).length === 0) {
            toast('Nothing to update.')
            return true
        }

        const originalTasks = tasks
        const originalSelectedTask = selectedTaskForDetails; // <--- Store original selected task for rollback
        const optimisticTask = { ...curr, ...payload }

        // Optimistically update relevant state
        if (tasks.find(t => t._id === curr._id)) {
            setTasks(prev => prev.map(t => (t._id === curr._id ? optimisticTask : t)));
        }
        if (selectedTaskForDetails && selectedTaskForDetails._id === curr._id) {
            setSelectedTaskForDetails(optimisticTask);
        }

        try {
            const { data: saved } = await axios.put(
                `${API_URL}/tasks/${curr._id}`,
                payload,
                { headers: { Authorization: `Bearer ${currentToken}` } }
            )

            // Sync with server response
            if (tasks.find(t => t._id === curr._id)) {
                setTasks(prev => prev.map(t => (t._id === curr._id ? saved : t)));
            }
            if (selectedTaskForDetails && selectedTaskForDetails._id === curr._id) {
                setSelectedTaskForDetails(saved);
            }

            toast.success('Task updated!')
            return true
        } catch (err) {
            console.error('Failed to update task:', err)
            toast.error(err.response?.data?.message || 'Failed to update task.')
            // rollback
            setTasks(originalTasks);
            setSelectedTaskForDetails(originalSelectedTask); // <--- Rollback selected task
            fetchTasksForInbox?.();
            return false
        }
    }

    const handleDeleteTaskConfirmed = async (taskId) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            toast.error('Authentication required to delete task.');
            return false;
        }

        // Optimistic update (store original for rollback)
        const originalTasks = tasks;
        const originalSelectedTask = selectedTaskForDetails; // <--- Store original selected task

        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
        if (selectedTaskForDetails && selectedTaskForDetails._id === taskId) {
            setSelectedTaskForDetails(null); // Clear selected task if it's the one being deleted
            navigate('/dashboard/inbox', { replace: true }); // Go back to inbox list
        }

        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            toast.success("Task deleted!");
            return true;
        } catch (err) {
            console.error('Failed to delete task:', err);
            toast.error(err.response?.data?.message || 'Failed to delete task.');
            // Revert optimistic update or re-fetch on failure
            setTasks(originalTasks); // Rollback
            setSelectedTaskForDetails(originalSelectedTask); // Rollback selected task
            fetchTasksForInbox(); // Fallback re-fetch
            return false;
        }
    };

    // <--- NEW: Handler for clicking a task card to view its details page
    const handleTaskCardClick = (task) => {
        setSelectedTaskForDetails(task);
        navigate(`/dashboard/inbox?taskId=${task._id}`); // Update URL
    };

    // <--- NEW: Handler to go back to the inbox tasks list
    const handleBackToInbox = () => {
        setSelectedTaskForDetails(null);
        navigate('/dashboard/inbox', { replace: true }); // Clear taskId from URL
    };
    // NEW HANDLERS --->

    return {
        tasks,
        loading,
        error,
        selectedProjectId: inboxProjectId,
        selectedTaskForDetails, // <--- EXPOSE NEW STATE
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
        handleTaskCardClick, // <--- EXPOSE NEW HANDLER
        handleBackToInbox, // <--- EXPOSE NEW HANDLER
        refetchTasks: fetchTasksForInbox // Provide a way to manually refetch if needed (e.g., after filter change)
    };
};