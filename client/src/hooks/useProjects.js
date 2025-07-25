// src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);

    const token = localStorage.getItem('token');
    const location = useLocation();
    const navigate = useNavigate();

    // Function to fetch projects (all or a specific one)
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            const queryParams = new URLSearchParams(location.search);
            const projectIdFromUrl = queryParams.get('projectId');

            if (projectIdFromUrl) {
                // Fetch specific project if projectId is in URL
                const res = await axios.get(`${API_URL}/projects/${projectIdFromUrl}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelectedProjectForTasks(res.data);
                setProjects([]); // Clear general projects list when viewing a single project's tasks
            } else {
                // Fetch all non-inbox projects
                const res = await axios.get(`${API_URL}/projects`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const filteredProjects = res.data.filter(project => !project.isInbox);
                setProjects(filteredProjects);
                setSelectedProjectForTasks(null); // Reset selected project for tasks
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.response?.data?.message || 'Failed to load data.');
            setProjects([]);
            setSelectedProjectForTasks(null);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and re-fetch on URL or token changes
    useEffect(() => {
        fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, location.pathname, token]); // Watches pathname changes too

    // Handlers for project CRUD operations
    const handleCreateProject = async (projectData) => {
        try {
            await axios.post(`${API_URL}/projects`, projectData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Created Project!");
            fetchProjects(); // Re-fetch all projects to update the list
            return true;
        } catch (err) {
            console.error('Failed to create project:', err);
            setError(err.response?.data?.message || 'Failed to create project.');
            return false;
        }
    };

    const handleUpdateProject = async (updatedProject) => {
        try {
            await axios.put(`${API_URL}/projects/${updatedProject._id}`, updatedProject, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Updated Project!");
            fetchProjects(); // Re-fetch all projects to update the list
            return true;
        } catch (err) {
            console.error('Failed to update project:', err);
            setError(err.response?.data?.message || 'Failed to update project.');
            return false;
        }
    };

    const handleDeleteProjectConfirmed = async (projectId) => {
        try {
            await axios.delete(`${API_URL}/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Deleted Project!");
            fetchProjects(); // Re-fetch all projects to ensure consistency
            return true;
        } catch (err) {
            console.error('Failed to delete project:', err);
            setError(err.response?.data?.message || 'Failed to delete project.');
            return false;
        }
    };

    const toggleFavorite = async (project) => {
        try {
            const endpoint = project.isFavorite ? 'unfavorite' : 'favorite';
            const res = await axios.patch(`${API_URL}/projects/${project._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state optimistically or re-fetch
            setProjects(prev =>
                prev.map(p => (p._id === project._id ? res.data : p))
            );
            if (project.isFavorite) toast.error("Project Unfavored!");
            else toast.success("Project Favored!");
            fetchProjects(); // Re-fetch all projects to update the list and sidebar favorites
        } catch (err) {
            console.error(`Failed to ${project.isFavorite ? 'unfavorite' : 'favorite'} project`, err);
            setError(err.response?.data?.message || `Failed to ${project.isFavorite ? 'unfavorite' : 'favorite'} project`);
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
        fetchProjects // Expose fetchProjects for manual re-fetching if needed
    };
};
