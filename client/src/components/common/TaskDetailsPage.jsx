// src/pages/TaskDetailsPage.jsx (New Component)
import React from 'react';
import { ArrowLeft, CheckCircle, Circle, Tag } from 'lucide-react';

const TaskDetailsPage = ({ task, onBackToInbox }) => {
    if (!task) {
        return (
            <div className="md:ml-72 mt-8 px-4 py-6 text-center text-gray-500">
                Task not found.
                <button
                    onClick={onBackToInbox}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Back to Inbox
                </button>
            </div>
        );
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'text-blue-500';
            case 2: return 'text-green-500';
            case 3: return 'text-yellow-500';
            case 4: return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
            case 4: return 'Urgent';
            default: return 'None';
        }
    };

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md"> {/* Changed background to static */}
                <div className='flex items-center gap-2'>
                    <button
                        onClick={onBackToInbox}
                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 flex items-center gap-1 text-gray-900 dark:text-white ml-12 md:ml-0"
                        aria-label="Back to Inbox"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Details</h1> {/* Changed text color to static */}
                </div>
            </div>

            <div className="pt-10 pb-18"> {/* Spacer for fixed header */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md space-y-4">
                    <h2 className={`text-3xl font-bold ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.content}
                    </h2>
                    {task.description && (
                        <p className="text-gray-700 dark:text-zinc-400 text-lg">
                            {task.description}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 dark:text-zinc-300">
                        {task.dueDate && (
                            <div className="flex items-center gap-2 text-md">
                                <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </div>
                        )}
                        {task.priority !== undefined && task.priority !== null && (
                            <div className="flex items-center gap-2 text-md">
                                <strong>Priority:</strong> <span className={getPriorityColor(task.priority)}>{getPriorityLabel(task.priority)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-md">
                            <strong>Status:</strong> {task.isCompleted ? (
                                <span className="flex items-center text-green-500">
                                    <CheckCircle className="w-5 h-5 mr-1" /> Completed
                                </span>
                            ) : (
                                <span className="flex items-center text-gray-500 dark:text-zinc-400">
                                    <Circle className="w-5 h-5 mr-1" /> Incomplete
                                </span>
                            )}
                        </div>
                        {task.projectId && (
                            <div className="flex items-center gap-2 text-md">
                                <strong>Project ID:</strong> <span className="font-mono text-sm">{task.projectId}</span>
                            </div>
                        )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center pt-4 border-t border-gray-200 dark:border-zinc-700">
                            <strong className='text-gray-900 dark:text-white'>Tags:</strong>
                            {task.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
                                    <Tag className="w-4 h-4" /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsPage;