import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Valid filter options (kept for sanitizeFilters)
const VALID_DUE_DATE_FILTERS = ['all', 'today', 'tomorrow', 'this_week', 'overdue'];
const VALID_PRIORITY_FILTERS = ['all', 'none', 'low', 'medium', 'high', 'urgent'];

/**
 * Custom hook to manage tasks for a specific project with advanced filtering capabilities.
 * It reads and updates filters from URL search parameters, and fetches tasks from the API.
 * * @param {object} project - The project object for which tasks are managed
 * @returns {object} - An object containing tasks, loading state, error, filter values,
 * and CRUD operations.
 */
export const useProjectTasks = (project) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Get current filter values from URL search parameters
    const dueDateFilter = searchParams.get('dueDate') || 'all';
    const priorityFilter = searchParams.get('priority') || 'all';
    const taskIdFromUrl = searchParams.get('taskId'); // Still read taskId from URL

    const token = localStorage.getItem('token');

    /**
     * Updates URL search parameters while preserving existing ones.
     * If a value is 'null' or 'all', the parameter is removed from the URL.
     * @param {object} updates - Key-value pairs to update in URL (e.g., { dueDate: 'today' })
     */
    const updateSearchParams = useCallback((updates) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === 'all') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    /**
     * Validates and sanitizes filter values from URL.
     * If URL params contain invalid filter values, they are corrected to 'all' and the URL is updated.
     * @returns {object} - Sanitized filter values.
     */
    const sanitizeFilters = useCallback(() => {
        const sanitized = {
            dueDate: VALID_DUE_DATE_FILTERS.includes(dueDateFilter) ? dueDateFilter : 'all',
            priority: VALID_PRIORITY_FILTERS.includes(priorityFilter) ? priorityFilter : 'all'
        };
        
        // Update URL if filters needed sanitization
        if (sanitized.dueDate !== dueDateFilter || sanitized.priority !== priorityFilter) {
            updateSearchParams({
                dueDate: sanitized.dueDate,
                priority: sanitized.priority
            });
        }
        
        return sanitized;
    }, [dueDateFilter, priorityFilter, updateSearchParams]);

    /**
     * Fetches tasks for the current project with applied filters.
     * This function is memoized and re-runs when project, token, or sanitized filters change.
     */
    const fetchProjectTasks = useCallback(async () => {
        // Do not fetch if project ID or token is missing
        if (!project?._id || !token) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { dueDate, priority } = sanitizeFilters(); // Get sanitized filters
            const params = new URLSearchParams();
            
            // Always include projectId as a query param for tasks endpoint if needed,
            // or ensure the endpoint itself uses the project ID from the path.
            // Assuming the endpoint '/tasks/project/:projectId' handles this.
            
            // Add filters to params if not 'all'
            if (dueDate !== 'all') params.append('dueDate', dueDate);
            if (priority !== 'all') params.append('priority', priority);

            // If taskIdFromUrl is present, fetch only that specific task
            if (taskIdFromUrl) {
                const url = `${API_URL}/tasks/${taskIdFromUrl}`;
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks([res.data]); // Set tasks to an array containing only the fetched task
            } else {
                // Otherwise, fetch all tasks for the project with applied filters
                // Ensure parentId=null is sent to get top-level tasks
                params.append('parentId', 'null'); 
                const url = `${API_URL}/tasks/project/${project._id}?${params.toString()}`;
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError(err.response?.data?.message || 'Failed to load tasks');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [project, token, sanitizeFilters, taskIdFromUrl]); // Re-fetch when taskIdFromUrl changes

    // Effect to trigger task fetching when dependencies change
    useEffect(() => {
        fetchProjectTasks();
    }, [fetchProjectTasks]);

    /**
     * Creates a new task with optimistic updates.
     * @param {object} taskData - The data for the new task.
     * @returns {boolean} - True if optimistic update was applied, false otherwise.
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
     * Toggles task completion status with optimistic updates.
     * @param {object} task - The task object to toggle.
     */
    const toggleComplete = async (task) => {
        if (!token) {
            toast.error('Authentication required');
            return;
        }

        const originalIsCompleted = task.isCompleted;
        const nextIsCompleted = !originalIsCompleted;

        setTasks(prev => prev.map(t => 
            t._id === task._id ? { ...t, isCompleted: nextIsCompleted } : t
        ));

        try {
            const endpoint = nextIsCompleted ? 'complete' : 'uncomplete';
            await axios.patch(
                `${API_URL}/tasks/${task._id}/${endpoint}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Task marked as ${nextIsCompleted ? 'completed' : 'incomplete'}`);
        } catch (err) {
            console.error('Failed to toggle completion:', err);
            setTasks(prev => prev.map(t => 
                t._id === task._id ? { ...t, isCompleted: originalIsCompleted } : t
            ));
            toast.error(err.response?.data?.message || 'Failed to update task');
        }
    };

    /**
     * Updates an existing task with only changed fields.
     * @param {object} updatedTask - The updated task object.
     * @returns {boolean} - True if update was successful or no changes, false otherwise.
     */
    const handleUpdateTask = async (updatedTask) => {
        if (!token) {
            toast.error('Authentication required');
            return false;
        }

        // Find the current version of the task in the state
        const currentTask = tasks.find(t => t._id === updatedTask._id);
        if (!currentTask) {
            toast.error('Task not found in current list.');
            // If the task isn't in the current list (e.g., due to filtering),
            // a full re-fetch might be needed to ensure consistency.
            fetchProjectTasks(); 
            return false;
        }

        const payload = {};
        Object.keys(updatedTask).forEach(key => {
            // Exclude backend-managed or derived fields from payload
            if (['_id', 'projectId', 'ownerId', '__v', 'createdAt', 'updatedAt', 'subtaskCount'].includes(key)) return;
            
            // Deep comparison for objects/arrays, direct comparison for primitives
            if (JSON.stringify(currentTask[key]) !== JSON.stringify(updatedTask[key])) {
                payload[key] = updatedTask[key];
            }
        });

        if (Object.keys(payload).length === 0) {
            toast('No changes detected');
            return true;
        }

        const originalTasks = tasks; // Store for rollback
        setTasks(prev => prev.map(t => 
            t._id === updatedTask._id ? { ...t, ...payload } : t
        ));

        try {
            await axios.put(
                `${API_URL}/tasks/${updatedTask._id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Task updated!');
            return true;
        } catch (err) {
            console.error('Failed to update task:', err);
            setTasks(originalTasks); // Rollback on error
            toast.error(err.response?.data?.message || 'Failed to update task');
            // Re-fetch to ensure UI consistency after rollback/error
            fetchProjectTasks(); 
            return false;
        }
    };

    /**
     * Deletes a task with optimistic updates.
     * @param {string} taskId - The ID of the task to delete.
     * @returns {boolean} - True if deletion was successful, false otherwise.
     */
    const handleDeleteTaskConfirmed = async (taskId) => {
        if (!token) {
            toast.error('Authentication required');
            return false;
        }

        const originalTasks = tasks; // Store for rollback
        setTasks(prev => prev.filter(t => t._id !== taskId));

        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Task deleted!');
            return true;
        } catch (err) {
            console.error('Failed to delete task:', err);
            setTasks(originalTasks); // Rollback on error
            toast.error(err.response?.data?.message || 'Failed to delete task');
            // Re-fetch to ensure UI consistency after rollback/error
            fetchProjectTasks(); 
            return false;
        }
    };

    /**
     * Updates filters in URL search parameters.
     * Also clears the taskId parameter to exit task details view when filters change.
     * @param {object} newFilters - Object containing new dueDate and/or priority values.
     */
    const updateFilters = useCallback((newFilters) => {
        // Create an object with all potential updates, including clearing taskId
        const updates = {
            dueDate: newFilters.dueDate || 'all',
            priority: newFilters.priority || 'all',
            taskId: null // Always clear taskId when filters are applied/changed
        };
        updateSearchParams(updates);
    }, [updateSearchParams]);

    // The tasks array directly contains the filtered results from the API.
    // No client-side filtering needed here as the API is expected to filter.

    return {
        tasks, // These are already filtered by the API based on URL params
        loading,
        error,
        filters: { // Expose current filter values and the update function
            dueDate: dueDateFilter,
            priority: priorityFilter,
            updateFilters
        },
        selectedTaskId: taskIdFromUrl, // Expose taskId from URL for component to use
        fetchProjectTasks, // Expose for manual re-fetching if needed
        handleCreateTask,
        toggleComplete,
        handleUpdateTask,
        handleDeleteTaskConfirmed
    };
};
