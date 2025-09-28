import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/search`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { query: query }
            });
            setSearchResults(res.data);
        } catch (err) {
            console.error('Failed to perform search:', err);
            setError(err.response?.data?.message || 'Failed to perform search. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        performSearch(query);
    };

    const updateSearchResult = async (item) => {
        try {
            const url = `${API_URL}/${item.type}s/${item._id}`;
            await axios.put(url, item, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(prev => prev.map(r => r._id === item._id ? item : r));
            toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Updated!`);
            return true;
        } catch (err) {
            console.error(`Failed to update ${item.type}:`, err);
            toast.error(err.response?.data?.message || `Failed to update ${item.type}.`);
            return false;
        }
    };

    const deleteSearchResult = async (item) => {
        try {
            const url = `${API_URL}/${item.type}s/${item._id}`;
            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(prev => prev.filter(r => r._id !== item._id));
            toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Deleted!`);
            return true;
        } catch (err) {
            console.error(`Failed to delete ${item.type}:`, err);
            toast.error(err.response?.data?.message || `Failed to delete ${item.type}.`);
            return false;
        }
    };

    const toggleComplete = async (task) => {
        if (task.type !== 'task') return;
        try {
            const endpoint = task.isCompleted ? 'uncomplete' : 'complete';
            const res = await axios.patch(`${API_URL}/tasks/${task._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(prev => prev.map(t => (t._id === task._id ? res.data : t)));
            if (task.isCompleted) toast.error('Task Uncompleted!');
            else toast.success('Task Completed!');
        } catch (err) {
            console.error(`Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`, err);
            toast.error(err.response?.data?.message || `Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`);
        }
    };

    return {
        searchQuery,
        searchResults,
        loading,
        error,
        handleSearchChange,
        updateSearchResult,
        deleteSearchResult,
        toggleComplete,
    };
};
