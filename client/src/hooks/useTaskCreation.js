import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useTaskCreation = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createTaskError, setCreateTaskError] = useState(null);

    const handleCreateTask = async (taskData) => {
        setCreateTaskError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setCreateTaskError('Authentication token not found. Please log in again.');
            return;
        }

        try {
            await axios.post(`${API_URL}/tasks`, taskData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            toast.success('Added Task!');
            // Optionally, you might want to refetch tasks in relevant pages after creation
            // This would typically be handled with a global state update or a specific context/hook.
        } catch (err) {
            console.error('Failed to create task:', err);
            setCreateTaskError(err.response?.data?.message || 'Failed to create task');
        }
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreateTaskError(null); // Clear error when closing modal
    };

    return {
        showCreateModal,
        setShowCreateModal,
        createTaskError,
        handleCreateTask,
        closeCreateModal
    };
};

export default useTaskCreation;