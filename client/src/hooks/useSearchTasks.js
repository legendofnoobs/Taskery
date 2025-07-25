// src/hooks/useSearchTasks.js
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useSearchTasks = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    // Function to perform the search
    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setError(null);
            return; // Don't search for empty queries
        }

        setLoading(true);
        setError(null);

        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/tasks/search`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { query: query } // Pass the search query as a URL parameter
            });
            setSearchResults(res.data);
        } catch (err) {
            console.error('Failed to perform search:', err);
            setError(err.response?.data?.message || 'Failed to perform search. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handler for search input change (triggers search immediately)
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        performSearch(query); // Perform search on every change
    };

    // Handles the update of an existing task in search results
    const handleUpdateTask = async (updated) => {
        try {
            await axios.put(`${API_URL}/tasks/${updated._id}`, updated, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update the task in searchResults directly
            setSearchResults(prev => prev.map(t => t._id === updated._id ? updated : t));
            toast.success('Task Updated!');
            return true;
        } catch (err) {
            console.error('Failed to update task:', err);
            setError(err.response?.data?.message || 'Failed to update task.');
            return false;
        }
    };

    // Handles the deletion of a task from search results
    const handleDeleteTaskConfirmed = async (taskId) => {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter out the deleted task from searchResults
            setSearchResults(prev => prev.filter(t => t._id !== taskId));
            toast.success('Task Deleted!');
            return true;
        } catch (err) {
            console.error('Failed to delete task:', err);
            setError(err.response?.data?.message || 'Failed to delete task.');
            return false;
        }
    };

    // Toggles the completion status of a task in search results
    const toggleComplete = async (task) => {
        try {
            const endpoint = task.isCompleted ? 'uncomplete' : 'complete';
            const res = await axios.patch(`${API_URL}/tasks/${task._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update the specific task in searchResults to trigger re-render
            setSearchResults(prev =>
                prev.map(t => (t._id === task._id ? res.data : t))
            );
            if (task.isCompleted) toast.error('Task Uncompleted!');
            else toast.success('Task Completed!');
        } catch (err) {
            console.error(`Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`, err);
            setError(err.response?.data?.message || `Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`);
        }
    };

    return {
        searchQuery,
        searchResults,
        loading,
        error,
        handleSearchChange,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
        toggleComplete,
    };
};
