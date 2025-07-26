import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import useFavoriteProjects from './useFavoriteProjects'; // Import useFavoriteProjects to refetch sidebar favorites

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
    const { refetchProjects: refetchSidebarFavorites } = useFavoriteProjects(); // Get refetch function
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inboxProjectId, setInboxProjectId] = useState(null); // State to hold the Inbox project ID

    // Memoized function to fetch the Inbox project ID
    const fetchAndSetInboxProjectId = useCallback(async () => {
        const currentToken = localStorage.getItem('token'); // Get latest token inside useCallback
        if (!user || !currentToken) {
            setInboxProjectId(null);
            setTasks([]);
            setLoading(false);
            setError(null);
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
    }, [user]); // Only depends on 'user' to trigger re-fetch on login/logout

    // Memoized function to fetch tasks based on the Inbox project ID and filters
    const fetchTasksForInbox = useCallback(async () => {
        const currentToken = localStorage.getItem('token'); // Get latest token inside useCallback
        if (!inboxProjectId || !currentToken) {
            console.log("useInboxTasks: Cannot fetch tasks - missing inboxProjectId or token.");
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
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
            console.log("useInboxTasks: Tasks fetched successfully:", res.data.length, "tasks.");
        } catch (err) {
            console.error('useInboxTasks: Failed to fetch tasks:', err);
            setError(err.response?.data?.message || 'Failed to load tasks.');
            setTasks([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inboxProjectId, filterDueDate, filterPriority, user]); // Depend on all relevant states/props and user for token changes

    // Effect 1: Fetch Inbox Project ID when user changes
    useEffect(() => {
        fetchAndSetInboxProjectId();
    }, [fetchAndSetInboxProjectId]);

    // Effect 2: Fetch tasks when Inbox Project ID or filters change
    useEffect(() => {
        if (inboxProjectId) { // Only fetch tasks if inboxProjectId is set
            fetchTasksForInbox();
        }
    }, [inboxProjectId, fetchTasksForInbox]);


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
            setTasks(prevTasks => [res.data, ...prevTasks]); // <-- CHANGED HERE
            toast.success("Task created!");
            refetchSidebarFavorites(); // Update sidebar if task creation affects project counts
            return true;
        } catch (err) {
            console.error('Failed to create task:', err);
            toast.error(err.response?.data?.message || 'Failed to create task.');
            // Fallback to re-fetch if optimistic update fails
            fetchTasksForInbox();
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
            // skip _id
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

        // 1) Find the current task in state
        const curr = tasks.find(t => t._id === updatedTaskFromModal._id)
        if (!curr) {
            toast.error('Task not found in UI state.')
            return false
        }

        // 2) Build the payload (send only what changed)
        const payload = diffTask(curr, updatedTaskFromModal)

        // Always preserve isCompleted if the modal didn’t send it
        if (payload.isCompleted === undefined) {
            payload.isCompleted = curr.isCompleted
        }

        // If nothing changed, just close modal
        if (Object.keys(payload).length === 0) {
            toast('Nothing to update.')
            return true
        }

        // 3) Optimistic update
        const originalTasks = tasks
        const optimisticTask = { ...curr, ...payload }

        setTasks(prev =>
            prev.map(t => (t._id === curr._id ? optimisticTask : t))
        )

        try {
            // 4) Call API
            const { data: saved } = await axios.put(
                `${API_URL}/tasks/${curr._id}`,
                payload,
                { headers: { Authorization: `Bearer ${currentToken}` } }
            )

            // 5) Sync with server response (just in case backend modified anything)
            setTasks(prev =>
                prev.map(t => (t._id === curr._id ? saved : t))
            )

            toast.success('Task updated!')
            // If you *really* want to ensure consistency (e.g., server-side hooks),
            // uncomment the next line:
            // await fetchTasksForInbox()

            return true
        } catch (err) {
            console.error('Failed to update task:', err)
            toast.error(err.response?.data?.message || 'Failed to update task.')
            // rollback
            setTasks(originalTasks)
            // Optionally hard refresh:
            fetchTasksForInbox?.()
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
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));

        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            toast.success("Task deleted!");
            // No need to re-fetch if optimistic update was successful and accurate
            return true;
        } catch (err) {
            console.error('Failed to delete task:', err);
            toast.error(err.response?.data?.message || 'Failed to delete task.');
            // Revert optimistic update or re-fetch on failure
            setTasks(originalTasks); // Rollback
            fetchTasksForInbox(); // Fallback re-fetch
            return false;
        }
    };

    return {
        tasks,
        loading,
        error,
        selectedProjectId: inboxProjectId, // Expose inbox project ID to the component
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
        refetchTasks: fetchTasksForInbox // Provide a way to manually refetch if needed (e.g., after filter change)
    };
};
