import { ArrowLeft, BadgePlus, FolderKanban } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import CreateProjectModal from '../../components/common/CreateProjectModal';
import EditProjectModal from '../../components/common/EditProjectModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import ProjectCard from '../../components/common/ProjectCard';
import ProjectTasksPage from './ProjectTasksPage';
import { useProjects } from '../../hooks/useProjects'; // Import the new hook

const Projects = () => {
    // Use the custom hook for project data and API interactions
    const {
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
    } = useProjects();

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // State for managing which project's dropdown is open
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

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

    // Handler to confirm deletion of a project
    const confirmDelete = (project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
        setOpenDropdownId(null); // Close dropdown
    };

    // Handler for actual deletion after confirmation
    const onDeleteConfirmed = async () => {
        if (projectToDelete) {
            await handleDeleteProjectConfirmed(projectToDelete._id);
            setShowDeleteModal(false);
            setProjectToDelete(null);
        }
    };

    // Conditionally render ProjectTasksPage or the list of projects
    if (selectedProjectForTasks) {
        return <ProjectTasksPage project={selectedProjectForTasks} onBackToProjects={handleBackToProjects} />;
    }

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-[color:var(--color-background)]/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <div className='flex items-center gap-2'>
                    <button className="p-1 rounded-full hover:bg-[color:var(--color-hover)]/10 transition-colors mr-2 block md:hidden" aria-label="Back to Projects">
                        <ArrowLeft className="w-6 h-6 text-[color:var(--color-text)]" />
                    </button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[color:var(--color-text)]">
                        <FolderKanban className="w-6 h-6 text-[color:var(--color-primary)]" /> Projects
                    </h1>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm"
                >
                    <BadgePlus className="w-4 h-4" />
                    <span className='hidden lg:block'>Create Project</span>
                </button>
            </div>

            {/* Spacer div to prevent content from being hidden behind the fixed header */}
            <div className="pt-10 pb-10"> {/* Adjusted padding */}
                {loading ? (
                    <div className="text-[color:var(--color-text)] opacity-70">Loading projects...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : projects.length === 0 ? (
                    <div className="text-[color:var(--color-text)] opacity-50 italic">No projects found. Create your first project!</div>
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
            </div>

            {/* Modals */}
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
                onConfirm={onDeleteConfirmed}
                title="Delete Project"
                message={projectToDelete ? `Are you sure you want to delete the project "${projectToDelete.name}"? This action cannot be undone.` : "Are you sure you want to delete this project? This action cannot be undone."}
            />
        </div>
    );
}

export default Projects;