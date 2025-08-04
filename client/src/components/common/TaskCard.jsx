import React from 'react';
import { CheckCircle, Circle, Edit, MoreVertical, ReceiptText, Tag, Trash2, ListTree } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'; // Make sure this is 'framer-motion' not 'motion/react'

/**
 * Reusable component to display a single task or subtask in a list.
 * It includes content, description, tags, due date, priority, and completion status.
 * It also handles the dropdown menu for task actions (Details, Edit, Delete).
 *
 * @param {object} props - The component props.
 * @param {object} props.task - The task object to display.
 * @param {function} [props.onToggleComplete] - Function to call when the completion status is toggled.
 * @param {function} [props.onViewDetails] - Function to call when "Details" is clicked in the dropdown. Pass null to hide.
 * @param {function} [props.onEditTask] - Function to call when "Edit" is clicked.
 * @param {function} [props.onConfirmDelete] - Function to call when "Delete" is clicked.
 * @param {function} [props.onClick] - Function to call when the task card itself is clicked (e.g., to view details).
 * @param {string|null} props.openDropdownId - The ID of the task whose dropdown is currently open.
 * @param {function} props.setOpenDropdownId - Function to set the ID of the currently open dropdown.
 * @param {React.RefObject} props.dropdownRef - Ref object to detect clicks outside the dropdown.
 * @param {boolean} [props.isSubtask=false] - If true, applies specific styling for subtasks.
 * @param {number} [props.subtaskCount=0] - The number of subtasks associated with this task (passed from parent).
 */
const TaskCard = ({
    task,
    onToggleComplete,
    onViewDetails,
    onEditTask,
    onConfirmDelete,
    onClick,
    openDropdownId,
    setOpenDropdownId,
    dropdownRef,
    isSubtask = false,
    subtaskCount = 0
}) => {
    // Define the variants for the individual task card
    // These will be controlled by the parent's `staggerChildren`
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring", // Use a spring animation for a bouncier feel
                stiffness: 200, // Stiffness of the spring
                damping: 20    // Damping to reduce oscillation
            }
        },
        exit: {
            opacity: 0,
            x: -20, // Animate out to the left
            transition: {
                duration: 0.2
            }
        }
    };

    // Helper function to convert numerical priority to a human-readable string
    const getPriorityString = (priorityNumber) => {
        const num = Number(priorityNumber); // Ensure priority is treated as a number
        switch (num) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
            case 4: return 'Urgent';
            default: return 'Low'; // Default to 'Low' if null, undefined, or unrecognized numbers
        }
    };

    // Determine priority color based on numeric value for text color
    const getPriorityColor = (priority) => {
        const num = Number(priority); // Ensure priority is treated as a number
        switch (num) {
            case 1: return 'text-blue-500'; // Low
            case 2: return 'text-green-500'; // Medium
            case 3: return 'text-yellow-500'; // High
            case 4: return 'text-red-500'; // Urgent
            default: return 'text-blue-500'; // Default to 'Low' priority color
        }
    };

    // Determine priority background color for the dot
    const getPriorityDotColor = (priority) => {
        const num = Number(priority); // Ensure priority is treated as a number
        switch (num) {
            case 1: return 'bg-blue-500'; // Low
            case 2: return 'bg-green-500'; // Medium
            case 3: return 'bg-yellow-500'; // High
            case 4: return 'bg-red-500'; // Urgent
            default: return 'bg-blue-500'; // Default to 'Low' priority dot color
        }
    };

    /**
     * Determines the background and text color classes for the due date based on its proximity.
     * Also returns the display string for the due date.
     * @param {string} dueDateString - The due date string (e.g., 'YYYY-MM-DD').
     * @returns {object} An object containing:
     * - {string} className: Tailwind CSS classes for background and text color.
     * - {string} displayString: The formatted string to display (e.g., "Due: Today", "Overdue: MM/DD/YYYY").
     */
    const getDueDateDisplay = (dueDateString) => {
        if (!dueDateString) {
            return {
                className: 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-white',
                displayString: 'No Due Date'
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to start of day

        const taskDueDate = new Date(dueDateString);
        taskDueDate.setHours(0, 0, 0, 0); // Normalize task due date to start of day

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Normalize tomorrow to start of day

        if (taskDueDate.getTime() === today.getTime()) {
            return { className: 'bg-red-500 text-white', displayString: 'Due: Today' }; // Due today
        } else if (taskDueDate.getTime() === tomorrow.getTime()) {
            return { className: 'bg-yellow-500 text-gray-900', displayString: 'Due: Tomorrow' }; // Due tomorrow (dark text for contrast)
        } else if (taskDueDate.getTime() < today.getTime()) {
            // This case handles overdue tasks (due date is before today)
            return { className: 'bg-red-800 text-white', displayString: `Overdue: ${new Date(dueDateString).toLocaleDateString()}` }; // Overdue, a darker red
        } else {
            return { className: 'bg-green-500 text-white', displayString: `Due: ${new Date(dueDateString).toLocaleDateString()}` }; // Due in the future
        }
    };

    /**
     * Truncates a string to a specified number of words and adds an ellipsis if truncated.
     * @param {string} text - The input string.
     * @param {number} wordLimit - The maximum number of words.
     * @returns {string} The truncated string.
     */
    const truncateWords = (text, wordLimit) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + '...';
        }
        return text;
    };

    const truncatedContent = truncateWords(task.content, 15);
    const truncatedDescription = truncateWords(task.description, 25);

    // Get due date display properties
    const { className: dueDateClassName, displayString: dueDateDisplayString } = getDueDateDisplay(task.dueDate);

    return (
        <motion.li // Use motion.li for animation
            key={task._id}
            className={`p-4 rounded-xl shadow-sm flex flex-row md:items-center dark:bg-zinc-800 justify-between gap-2 bg-white dark:text-white hover:shadow-[0px_0px_20px_5px_rgb(66,135,245,0.1)] transition-shadow ${isSubtask ? 'border-l-2 border-gray-300 dark:border-zinc-600 pl-4' : ''}`}
            onClick={onClick ? () => onClick(task) : undefined}

            // Framer Motion props using variants
            variants={cardVariants}
            layout // Keep layout for smooth position changes
        >
            <div className="flex items-start gap-4">
                {/* Toggle Complete Button (only if onToggleComplete prop is provided) */}
                {onToggleComplete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card onClick from firing
                            onToggleComplete(task);
                        }}
                        className={`hover:opacity-80 transition-opacity ${getPriorityColor(task.priority)}`}
                        aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        {task.isCompleted ? <CheckCircle /> : <Circle />}
                    </button>
                )}

                <div>
                    <h2 className={`text-lg font-semibold mb-1 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {truncatedContent}
                    </h2>
                    {task.description && <p className="text-gray-700 dark:text-zinc-400 text-sm mt-1">{truncatedDescription}</p>}
                    <div className='flex flex-wrap gap-2 items-center mt-2'>
                        {/* Priority Dot */}
                        {/* The dot will now always show, defaulting to 'Low' if priority is null/undefined */}
                        <div
                            className={`w-2 h-2 rounded-full ${getPriorityDotColor(task.priority)}`}
                            // Use the new helper function for a more descriptive tooltip
                            title={`Priority: ${getPriorityString(task.priority)}`} 
                        ></div>

                        {/* Due Date */}
                        {task.dueDate && (
                            <div className={`px-2 py-1 text-sm rounded-full ${dueDateClassName}`}>
                                {dueDateDisplayString}
                            </div>
                        )}

                        {/* Subtasks Count */}
                        {subtaskCount > 0 && (
                            <div className="px-2 py-1 text-sm rounded-full bg-gray-200 text-gray-700 dark:text-white dark:bg-zinc-700 flex items-center gap-1">
                                <ListTree className='w-4 h-4' /> {subtaskCount} Subtask{subtaskCount > 1 ? 's' : ''}
                            </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="px-2 py-1 text-sm rounded-full bg-gray-200 text-gray-700 dark:text-white dark:bg-zinc-700 flex items-center gap-1">
                                    <Tag className='w-4 h-4' /> {task.tags[0]}
                                </span>
                                {task.tags.length > 1 && (
                                    <span className="px-2 py-1 text-sm rounded-full bg-gray-200 text-gray-700 dark:text-white dark:bg-zinc-700">
                                        +{task.tags.length - 1}
                                    </span>
                                )}
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
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:text-white dark:bg-zinc-700 rounded-md shadow-lg z-30 py-1">
                            {onViewDetails && ( // Conditionally render "Details" option
                                <button
                                    onClick={(e) => { e.stopPropagation(); onViewDetails(task); setOpenDropdownId(null); }}
                                    className="block w-full text-left px-4 py-2 text-sm dark:text-white dark:bg-zinc-700 text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                >
                                    <div className="flex items-center gap-2">
                                        <ReceiptText className='w-4 h-4' />
                                        Details
                                    </div>
                                </button>
                            )}
                            {onEditTask && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditTask(task); setOpenDropdownId(null); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:bg-zinc-700 dark:hover:bg-zinc-600"
                                >
                                    <div className="flex items-center gap-2">
                                        <Edit className='w-4 h-4' />
                                        Edit
                                    </div>
                                </button>
                            )}
                            {onConfirmDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onConfirmDelete(task); setOpenDropdownId(null); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                >
                                    <div className="flex items-center gap-2">
                                        <Trash2 className='w-4 h-4' />
                                        Delete
                                    </div>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </motion.li>
    );
};

export default TaskCard;
