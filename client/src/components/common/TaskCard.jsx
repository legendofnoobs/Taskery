import React from 'react';
import { CheckCircle, Circle, MoreVertical, Tag } from 'lucide-react';

/**
 * Reusable component to display a single task.
 * It includes content, description, tags, due date, priority, and completion status.
 * It also handles the dropdown menu for task actions (Details, Edit, Delete).
 *
 * @param {object} props - The component props.
 * @param {object} props.task - The task object to display.
 * @param {function} [props.onToggleComplete] - Function to call when the completion status is toggled.
 * @param {function} [props.onViewDetails] - Function to call when "Details" is clicked.
 * @param {function} [props.onEditTask] - Function to call when "Edit" is clicked.
 * @param {function} [props.onConfirmDelete] - Function to call when "Delete" is clicked.
 * @param {string|null} props.openDropdownId - The ID of the task whose dropdown is currently open.
 * @param {function} props.setOpenDropdownId - Function to set the ID of the currently open dropdown.
 * @param {React.RefObject} props.dropdownRef - Ref object to detect clicks outside the dropdown.
 */
const TaskCard = ({
    task,
    onToggleComplete,
    onViewDetails,
    onEditTask,
    onConfirmDelete,
    openDropdownId,
    setOpenDropdownId,
    dropdownRef // Passed from parent to handle click outside
}) => {
    // Determine priority color based on numeric value
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'bg-blue-500'; // Low
            case 2: return 'bg-green-500'; // Medium
            case 3: return 'bg-yellow-500'; // High
            case 4: return 'bg-red-500'; // Urgent
            default: return 'bg-gray-400'; // Default/No priority
        }
    };

    return (
        <li
            key={task._id}
            className={`p-4 rounded shadow-sm flex flex-row md:items-center justify-between gap-2 bg-white ${task.isCompleted ? 'opacity-60' : ''} dark:text-white dark:bg-zinc-800`}
        >
            <div className="flex items-start gap-4">
                {/* Toggle Complete Button (only if onToggleComplete prop is provided) */}
                {onToggleComplete && (
                    <button
                        onClick={() => onToggleComplete(task)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        {task.isCompleted ? <CheckCircle /> : <Circle />}
                    </button>
                )}

                <div>
                    <h2 className={`text-lg font-semibold mb-1 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {task.content}
                    </h2>
                    {task.description && <p className="text-gray-700 dark:text-zinc-400 text-sm mt-1">{task.description}</p>}
                    <div className='flex flex-wrap gap-2 items-center mt-2'>
                        {/* Priority Dot */}
                        {task.priority !== undefined && task.priority !== null && (
                            <div
                                className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                                title={`Priority: ${typeof task.priority === 'string'
                                    ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                                    : task.priority // Display as is if not a string (e.g., number)
                                    }`}
                            ></div>
                        )}
                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Display only the first tag */}
                                <span className="px-2 py-1 text-sm rounded bg-gray-200 text-gray-700 dark:text-white dark:bg-zinc-700 flex items-center gap-1">
                                    <Tag className='w-4 h-4' /> {task.tags[0]}
                                </span>
                                {/* If there are more tags, show the count */}
                                {task.tags.length > 1 && (
                                    <span className="px-2 py-1 text-sm rounded bg-gray-200 text-gray-700 dark:text-white dark:bg-zinc-700">
                                        +{task.tags.length - 1} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                            <div className="px-2 py-1 text-sm rounded bg-gray-200 text-gray-700 dark:text-white dark:bg-zinc-700">
                                {`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Three dots menu container (only if any action props are provided) */}
            {(onViewDetails || onEditTask || onConfirmDelete) && (
                <div className="relative" ref={openDropdownId === task._id ? dropdownRef : null}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent listItem click events if any
                            setOpenDropdownId(openDropdownId === task._id ? null : task._id);
                        }}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        aria-label="Task options"
                    >
                        <MoreVertical size={20} />
                    </button>
                    {/* Dropdown Menu */}
                    {openDropdownId === task._id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:text-white dark:bg-zinc-700 rounded-md shadow-lg z-10 py-1">
                            {onViewDetails && (
                                <button
                                    onClick={() => onViewDetails(task)}
                                    className="block w-full text-left px-4 py-2 text-sm dark:text-white dark:bg-zinc-700 text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                >
                                    Details
                                </button>
                            )}
                            {onEditTask && (
                                <button
                                    onClick={() => onEditTask(task)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:bg-zinc-700 dark:hover:bg-zinc-600"
                                >
                                    Edit
                                </button>
                            )}
                            {onConfirmDelete && (
                                <button
                                    onClick={() => onConfirmDelete(task)}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </li>
    );
};

export default TaskCard;
