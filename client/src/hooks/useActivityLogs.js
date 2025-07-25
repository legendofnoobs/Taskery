// src/hooks/useActivityLogs.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingAllLogs, setDeletingAllLogs] = useState(false);

    const token = localStorage.getItem('token');

    /**
     * Fetches activity logs from the backend.
     */
    const fetchActivityLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/activity-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch activity logs:', err);
            setError(err.response?.data?.message || 'Failed to fetch activity logs.');
            setLogs([]); // Clear logs on error
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch of activity logs on component mount or when token changes
    useEffect(() => {
        fetchActivityLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    /**
     * Handles the deletion of all activity logs.
     */
    const handleDeleteAllLogsConfirmed = async () => {
        setDeletingAllLogs(true);
        setError(null); // Clear previous errors
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setDeletingAllLogs(false);
                return false; // Indicate failure
            }

            await axios.delete(`${API_URL}/activity-logs/delete-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLogs([]); // Clear logs from state immediately
            toast.success('Deleted All Logs!');
            setDeletingAllLogs(false);
            return true; // Indicate success
        } catch (err) {
            console.error('Failed to delete all activity logs:', err);
            setError(err.response?.data?.message || 'Failed to delete all activity logs.');
            setDeletingAllLogs(false);
            return false;
        }
    };

    return {
        logs,
        loading,
        error,
        deletingAllLogs,
        fetchActivityLogs, // Expose for potential re-fetching
        handleDeleteAllLogsConfirmed,
    };
};
