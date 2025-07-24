import { BadgePlus, FolderKanban, Plus, Star } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useLocation to read URL query parameters
import CreateProjectModal from '../../components/common/CreateProjectModal';
import EditProjectModal from '../../components/common/EditProjectModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import ProjectCard from '../../components/common/ProjectCard';
import ProjectTasksPage from './ProjectTasksPage';
import { useNavigate } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Projects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // State for managing which project's dropdown is open
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

    // State to manage the currently selected project for viewing tasks
    const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);

    const token = localStorage.getItem('token');
    const location = useLocation(); // Hook to access URL location object

    useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                return;
            }

            const queryParams = new URLSearchParams(location.search);
            const projectIdFromUrl = queryParams.get('projectId');

            if (projectIdFromUrl) {
                // Fetch specific project
                const res = await axios.get(`${API_URL}/projects/${projectIdFromUrl}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelectedProjectForTasks(res.data);
            } else {
                // Fetch all non-inbox projects
                const res = await axios.get(`${API_URL}/projects`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const filteredProjects = res.data.filter(project => !project.isInbox);
                setProjects(filteredProjects);
                setSelectedProjectForTasks(null); // Reset selected project
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

    fetchData();
}, [location.search, location.pathname, token]); // ✅ now watches pathname changes too


    // Effect to handle clicks outside of the dropdown menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]);

    const handleCreateProject = async (projectData) => {
        try {
            await axios.post(`${API_URL}/projects`, projectData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            // After creation, re-fetch all projects to update the list
            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filteredProjects = res.data.filter(project => !project.isInbox);
            setProjects(filteredProjects);
        } catch (err) {
            console.error('Failed to create project:', err);
            setError(err.response?.data?.message || 'Failed to create project.');
        }
    };

    const handleUpdateProject = async (updatedProject) => {
        try {
            await axios.put(`${API_URL}/projects/${updatedProject._id}`, updatedProject, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingProject(null); // Close modal
            // After update, re-fetch all projects to update the list
            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filteredProjects = res.data.filter(project => !project.isInbox);
            setProjects(filteredProjects);
        } catch (err) {
            console.error('Failed to update project:', err);
            setError(err.response?.data?.message || 'Failed to update project.');
        }
    };

    const confirmDelete = (project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
        setOpenDropdownId(null); // Close dropdown
    };

    const handleDeleteProjectConfirmed = async () => {
        if (!projectToDelete) return;

        try {
            await axios.delete(`${API_URL}/projects/${projectToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(prev => prev.filter(p => p._id !== projectToDelete._id)); // Optimistic removal
            setShowDeleteModal(false);
            setProjectToDelete(null);
            // After deletion, re-fetch all projects to ensure consistency
            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filteredProjects = res.data.filter(project => !project.isInbox);
            setProjects(filteredProjects);
        } catch (err) {
            console.error('Failed to delete project:', err);
            setError(err.response?.data?.message || 'Failed to delete project.');
            setShowDeleteModal(false);
            setProjectToDelete(null);
        }
    };

    const toggleFavorite = async (project) => {
        try {
            const endpoint = project.isFavorite ? 'unfavorite' : 'favorite';
            const res = await axios.patch(`${API_URL}/projects/${project._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistically update the project's favorite status in the local state
            setProjects(prev =>
                prev.map(p => (p._id === project._id ? res.data : p))
            );
            // Re-fetch all projects to update the list and sidebar favorites
            const resAll = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filteredProjects = resAll.data.filter(p => !p.isInbox);
            setProjects(filteredProjects);
        } catch (err) {
            console.error(`Failed to ${project.isFavorite ? 'unfavorite' : 'favorite'} project`, err);
            setError(err.response?.data?.message || `Failed to ${project.isFavorite ? 'unfavorite' : 'favorite'} project`);
        }
    };

    // Handler for clicking a project card
    const handleProjectCardClick = (project) => {
        setSelectedProjectForTasks(project);
    };

    // Handler to go back to the projects list
    const handleBackToProjects = () => {
        setSelectedProjectForTasks(null);
        // Clear the projectId from the URL when navigating back to the main projects list
        window.history.replaceState(null, '', '/dashboard/projects');
        navigate('/dashboard/projects', { replace: true });
    };

    // Conditionally render ProjectTasksPage or the list of projects
    if (selectedProjectForTasks) {
        return <ProjectTasksPage project={selectedProjectForTasks} onBackToProjects={handleBackToProjects} />;
    }

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <FolderKanban className="w-6 h-6" /> Projects
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 font-bold px-4 py-2 rounded disabled:opacity-50 gap-x-3 text-blue-600 hover:bg-blue-700 hover:text-white transition-colors"
                >
                    <BadgePlus className="w-4 h-4" />
                    Create Project
                </button>
            </div>

            {loading ? (
                <div className="text-gray-500">Loading projects...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : projects.length === 0 ? (
                <div className="text-gray-400 italic">No projects found. Create your first project!</div>
            ) : (
                <ul className="space-y-4">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onToggleFavorite={toggleFavorite}
                            onEditProject={(projectToEdit) => {
                                setEditingProject(projectToEdit);
                                setOpenDropdownId(null); // Close dropdown
                            }}
                            onConfirmDelete={confirmDelete}
                            onProjectClick={handleProjectCardClick} // Pass the click handler
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            dropdownRef={dropdownRef}
                        />
                    ))}
                </ul>
            )}

            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onProjectCreated={handleCreateProject}
            />

            <EditProjectModal
                isOpen={!!editingProject}
                onClose={() => setEditingProject(null)}
                project={editingProject}
                onUpdate={handleUpdateProject}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                }}
                onConfirm={handleDeleteProjectConfirmed}
                title="Delete Project"
                message={projectToDelete ? `Are you sure you want to delete the project "${projectToDelete.name}"? This action cannot be undone.` : "Are you sure you want to delete this project? This action cannot be undone."}
            />
        </div>
    );
}

export default Projects;
