import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAiChat = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const sendMessage = async (message) => {
        setLoading(true);
        setError(null);

        const userMessage = { role: 'user', parts: [{ text: message }] };

        try {
            const res = await axios.post(`${API_URL}/ai/chat`, { 
                message,
                history 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const modelMessage = { role: 'model', parts: [{ text: res.data.reply }] };

            setHistory(prev => [...prev, userMessage, modelMessage]);
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err.response?.data?.message || 'Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    return {
        history,
        loading,
        error,
        sendMessage,
        setHistory
    };
};
