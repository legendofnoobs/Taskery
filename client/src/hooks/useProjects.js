
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth'; // Assuming useAuth is in ../context/useAuth
import useFavoriteProjects from './useFavoriteProjects'; // Import the useFavoriteProjects hook

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook to manage all project-related data and CRUD operations.
 * It also handles navigation to project-specific task pages and ensures
 * sidebar favorite projects are updated.
 */
export const useProjects = () => {
    const { user } = useAuth(); // Get user from useAuth context
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);

    const token = localStorage.getItem('token'); // Get token directly here as it's used in API calls
    const location = useLocation();
    const navigate = useNavigate();

    // Get the refetch function from useFavoriteProjects to update the sidebar
    const { refetchProjects: refetchSidebarFavorites } = useFavoriteProjects();

    // Memoized function to fetch all projects (excluding inbox if not explicitly requested)
    const fetchAllProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                setProjects([]); // Clear projects if not authenticated
                setSelectedProjectForTasks(null);
                return;
            }

            const queryParams = new URLSearchParams(location.search);
            const projectIdFromUrl = queryParams.get('projectId');

            if (projectIdFromUrl) {
                // If a projectId is in the URL, fetch that specific project
                const res = await axios.get(`${API_URL}/projects/${projectIdFromUrl}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelectedProjectForTasks(res.data);
                setProjects([]); // Clear general projects list when viewing a single project's tasks
            } else {
                // Otherwise, fetch all non-inbox projects for the main list
                const res = await axios.get(`${API_URL}/projects`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const nonInboxProjects = res.data.filter(project => !project.isInbox);
                setProjects(nonInboxProjects);
                setSelectedProjectForTasks(null); // Reset selected project for tasks
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setError(err.response?.data?.message || 'Failed to load projects.');
            setProjects([]);
            setSelectedProjectForTasks(null);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, location.search, location.pathname]); // Dependencies for useCallback

    // Effect to trigger initial fetch and re-fetch on URL changes or user changes
    useEffect(() => {
        if (user) {
            fetchAllProjects();
        } else {
            setProjects([]);
            setLoading(false);
            setSelectedProjectForTasks(null);
        }
    }, [user, fetchAllProjects]); // Depend on `user` and the stable `fetchAllProjects`

    // Handlers for project CRUD operations
    const handleCreateProject = async (projectData) => {
        try {
            await axios.post(`${API_URL}/projects`, projectData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Created Project!");
            fetchAllProjects(); // Re-fetch all projects to update the main list
            refetchSidebarFavorites(); // Update sidebar's favorite projects
            return true;
        } catch (err) {
            console.error('Failed to create project:', err);
            toast.error(err.response?.data?.message || 'Failed to create project.');
            return false;
        }
    };

    const handleUpdateProject = async (updatedProject) => {
        try {
            await axios.put(`${API_URL}/projects/${updatedProject._id}`, updatedProject, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Updated Project!");
            fetchAllProjects(); // Re-fetch all projects to update the main list
            refetchSidebarFavorites(); // Update sidebar's favorite projects
            return true;
        } catch (err) {
            console.error('Failed to update project:', err);
            toast.error(err.response?.data?.message || 'Failed to update project.');
            return false;
        }
    };

    const handleDeleteProjectConfirmed = async (projectId) => {
        try {
            await axios.delete(`${API_URL}/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Deleted Project!");
            fetchAllProjects(); // Re-fetch all projects to update the main list
            refetchSidebarFavorites(); // Update sidebar's favorite projects
            return true;
        } catch (err) {
            console.error('Failed to delete project:', err);
            toast.error(err.response?.data?.message || 'Failed to delete project.');
            return false;
        }
    };

    const toggleFavorite = async (project) => {
        try {
            const endpoint = project.isFavorite ? 'unfavorite' : 'favorite';
            const res = await axios.patch(`${API_URL}/projects/${project._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistically update the local 'projects' state to reflect the change immediately
            setProjects(prevProjects =>
                prevProjects.map(p => (p._id === project._id ? { ...p, isFavorite: res.data.isFavorite } : p))
            );

            if (res.data.isFavorite) toast.success("Project Favored!");
            else toast.error("Project Unfavored!");

            refetchSidebarFavorites(); // <--- THIS IS THE KEY: Call to update sidebar favorites immediately
        } catch (err) {
            console.error(`Failed to ${project.isFavorite ? 'unfavorite' : 'favorite'} project`, err);
            toast.error(err.response?.data?.message || `Failed to ${project.isFavorite ? 'unfavorite' : 'favorite'} project`);
        }
    };

    // Handler for clicking a project card to view its tasks
    const handleProjectCardClick = (project) => {
        setSelectedProjectForTasks(project);
        navigate(`/dashboard/projects?projectId=${project._id}`); // Update URL
    };

    // Handler to go back to the projects list
    const handleBackToProjects = () => {
        setSelectedProjectForTasks(null);
        navigate('/dashboard/projects', { replace: true }); // Clear projectId from URL
    };

    return {
        projects,
        loading,
        error,
        selectedProjectForTasks,
        handleCreateProject,
        handleUpdateProject,
        handleDeleteProjectConfirmed,
        toggleFavorite,
        handleProjectCardClick,
        handleBackToProjects,
        refetchAllProjects: fetchAllProjects // Expose fetchAllProjects for manual re-fetching if needed
    };
};
