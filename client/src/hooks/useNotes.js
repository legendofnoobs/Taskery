import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useNotes = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/notes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(res.data);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
            setError(err.response?.data?.message || 'Failed to load notes.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            fetchNotes();
        } else {
            setNotes([]);
            setLoading(false);
        }
    }, [user, fetchNotes]);

    const createNote = async (noteData) => {
        try {
            await axios.post(`${API_URL}/notes`, noteData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Created Note!");
            fetchNotes();
            return true;
        } catch (err) {
            console.error('Failed to create note:', err);
            toast.error(err.response?.data?.message || 'Failed to create note.');
            return false;
        }
    };

    const updateNote = async (updatedNote) => {
        try {
            await axios.put(`${API_URL}/notes/${updatedNote._id}`, updatedNote, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Updated Note!");
            fetchNotes();
            return true;
        } catch (err) {
            console.error('Failed to update note:', err);
            toast.error(err.response?.data?.message || 'Failed to update note.');
            return false;
        }
    };

    const deleteNote = async (noteId) => {
        try {
            await axios.delete(`${API_URL}/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Deleted Note!");
            fetchNotes();
            return true;
        } catch (err) {
            console.error('Failed to delete note:', err);
            toast.error(err.response?.data?.message || 'Failed to delete note.');
            return false;
        }
    };

    return {
        notes,
        loading,
        error,
        createNote,
        updateNote,
        deleteNote,
        refetchNotes: fetchNotes
    };
};
