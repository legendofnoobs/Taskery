import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useFavoriteProjects from '../../../hooks/useFavoriteProjects'; // Adjust path as needed

const FavoriteProjectsList = ({ closeSidebar }) => {
    const navigate = useNavigate();
    const { favoriteProjects, projectsLoading, projectsError } = useFavoriteProjects();

    return (
        <div className="mt-4">
            <h4 className="text-xs text-gray-400 mb-1">Favorites</h4>
            <ul className="space-y-1 text-sm">
                {projectsLoading ? (
                    <li className="px-3 py-1 text-gray-500">Loading favorites...</li>
                ) : projectsError ? (
                    <li className="px-3 py-1 text-red-500">Error loading projects.</li>
                ) : favoriteProjects.length === 0 ? (
                    <li className="px-3 py-1 text-gray-500 italic">No favorites yet.</li>
                ) : (
                    favoriteProjects.map(project => (
                        <li key={project._id}>
                            <button
                                className="flex items-center gap-x-2 w-full text-left text-base px-3 py-1 rounded-full transition-colors
                                    hover:bg-gray-200 dark:hover:bg-zinc-700 dark:text-white" // Added light theme hover
                                onClick={() => {
                                    navigate(`/dashboard/projects?projectId=${project._id}`);
                                    closeSidebar();
                                }}
                            >
                                <Star size={16} fill="currentColor" className="text-yellow-500" />
                                {project.name}
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default FavoriteProjectsList;
