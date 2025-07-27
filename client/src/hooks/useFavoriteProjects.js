import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth'; // Assuming useAuth is in ../context/useAuth

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook to fetch and manage favorite projects for the sidebar.
 * It provides a way to refetch the list of favorite projects on demand.
 */
const useFavoriteProjects = () => {
    const { user } = useAuth();
    const [favoriteProjects, setFavoriteProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState(null);

    // Memoized function to fetch favorite projects
    const fetchFavoriteProjects = useCallback(async () => {
        setProjectsLoading(true);
        setProjectsError(null); // Clear any previous errors
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // If no token, clear favorites and stop loading, but don't set an error
                // as it's a normal state if not logged in.
                setFavoriteProjects([]);
                setProjectsLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter for projects that are explicitly marked as favorite AND are not the inbox.
            const favored = res.data.filter(project => project.isFavorite && !project.isInbox);
            setFavoriteProjects(favored);
        } catch (err) {
            console.error('Failed to fetch favorite projects:', err);
            setProjectsError(err.response?.data?.message || 'Failed to fetch favorite projects.');
        } finally {
            setProjectsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchFavoriteProjects();
        } else {
            // Clear projects if user logs out
            setFavoriteProjects([]);
            setProjectsLoading(false);
        }
    }, [user, fetchFavoriteProjects]); // `fetchFavoriteProjects` is stable due to useCallback

    return {
        favoriteProjects,
        projectsLoading,
        projectsError,
        refetchProjects: fetchFavoriteProjects // Expose the fetch function for external components to trigger a refresh
    };
};

export default useFavoriteProjects;
