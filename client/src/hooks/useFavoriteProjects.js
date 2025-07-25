import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth'; // Assuming useAuth is in ../context/useAuth

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useFavoriteProjects = () => {
    const { user } = useAuth();
    const [favoriteProjects, setFavoriteProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState(null);

    const fetchFavoriteProjects = async () => {
        setProjectsLoading(true);
        setProjectsError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setProjectsLoading(false);
                return;
            }
            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const favored = res.data.filter(project => project.isFavorite && !project.isInbox);
            setFavoriteProjects(favored);
        } catch (err) {
            console.error('Failed to fetch favorite projects:', err);
            setProjectsError(err.response?.data?.message || 'Failed to fetch favorite projects.');
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchFavoriteProjects();
        } else {
            setFavoriteProjects([]); // Clear projects if user logs out
            setProjectsLoading(false);
        }
    }, [user]);

    return { favoriteProjects, projectsLoading, projectsError };
};

export default useFavoriteProjects;