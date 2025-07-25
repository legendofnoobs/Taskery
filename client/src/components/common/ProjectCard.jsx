import React from 'react';
import { Star, FolderKanban, MoreVertical, Trash2, Edit } from 'lucide-react';

/**
 * Reusable component to display a single project.
 * It includes project name, color, and actions like favorite, edit, delete.
 *
 * @param {object} props - The component props.
 * @param {object} props.project - The project object to display.
 * @param {function} [props.onToggleFavorite] - Function to call when the favorite status is toggled.
 * @param {function} [props.onEditProject] - Function to call when "Edit" is clicked.
 * @param {function} [props.onConfirmDelete] - Function to call when "Delete" is clicked.
 * @param {function} [props.onProjectClick] - Function to call when the project card itself is clicked.
 * @param {string|null} props.openDropdownId - The ID of the project whose dropdown is currently open.
 * @param {function} props.setOpenDropdownId - Function to set the ID of the currently open dropdown.
 * @param {React.RefObject} props.dropdownRef - Ref object to detect clicks outside the dropdown.
 */
const ProjectCard = ({
    project,
    onToggleFavorite,
    onEditProject,
    onConfirmDelete,
    onProjectClick, // New prop for card click
    openDropdownId,
    setOpenDropdownId,
    dropdownRef
}) => {
    // Determine the background color based on project.color
    const getProjectColorClass = (color) => {
        switch (color) {
            case 'red': return 'bg-red-100 text-red-800';
            case 'blue': return 'bg-blue-100 text-blue-800';
            case 'green': return 'bg-green-100 text-green-800';
            case 'yellow': return 'bg-yellow-100 text-yellow-800';
            case 'purple': return 'bg-purple-100 text-purple-800';
            case 'pink': return 'bg-pink-100 text-pink-800';
            case 'indigo': return 'bg-indigo-100 text-indigo-800';
            case 'teal': return 'bg-teal-100 text-teal-800';
            default: return 'bg-gray-100 text-gray-800'; // Default color
        }
    };

    return (
        <li
            key={project._id}
            className="p-4 rounded-lg shadow-sm flex items-center justify-between gap-4 bg-white border border-gray-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-neutral-700 cursor-pointer transition hover:bg-gray-100 hover:shadow-[0px_0px_20px_5px_rgb(66,135,245,0.1)]" // Added cursor-pointer
            onClick={() => onProjectClick && onProjectClick(project)} // Handle card click
        >
            <div className="flex items-center gap-4">
                {/* Project Icon with Color */}
                <div className={`p-2 rounded-full ${getProjectColorClass(project.color)}`}>
                    <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
            </div>

            <div className="flex items-center gap-2">
                {/* Favorite Button (only if onToggleFavorite prop is provided and not an inbox project) */}
                {onToggleFavorite && !project.isInbox && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when clicking favorite
                            onToggleFavorite(project);
                        }}
                        className={`p-1 rounded-full transition-colors ${project.isFavorite ? 'text-yellow-500 hover:bg-yellow-100' : 'text-gray-400 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-zinc-600'}`}
                        aria-label={project.isFavorite ? 'Unfavorite project' : 'Favorite project'}
                    >
                        <Star size={20} fill={project.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                )}

                {/* Three dots menu container */}
                <div className="relative" ref={openDropdownId === project._id ? dropdownRef : null}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Stop propagation to prevent listItem click events if any
                            setOpenDropdownId(openDropdownId === project._id ? null : project._id);
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors dark:hover:bg-zinc-600"
                        aria-label="Project options"
                    >
                        <MoreVertical size={20} />
                    </button>
                    {/* Dropdown Menu */}
                    {openDropdownId === project._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 dark:bg-zinc-700 dark:text-white dark:border-zinc-700 rounded-md shadow-lg z-10 py-1">
                            {onEditProject && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        onEditProject(project);
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-600"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                            )}
                            {onConfirmDelete && !project.isInbox && ( // Prevent deleting Inbox
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        onConfirmDelete(project);
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};

export default ProjectCard;
