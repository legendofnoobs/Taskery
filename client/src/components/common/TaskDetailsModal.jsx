// src/components/common/TaskDetailsModal.jsx
import React from 'react';
import { Tag, X } from 'lucide-react'; // For a close icon within the modal

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
    if (!isOpen || !task) return null; // Don't render if not open or no task provided

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    aria-label="Close details"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4">Task Details</h2>

                <div className="space-y-3 text-gray-800">
                    <p><strong>Content:</strong> {task.content}</p>
                    {task.description && <p><strong>Description:</strong> {task.description}</p>}
                    <p>
                        <strong>Status:</strong>{" "}
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${task.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {task.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                    </p>
                    {task.dueDate && (
                        <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
                    {task.priority && (
                        <p><strong>Priority:</strong> {task.priority === 1 ? (
                            <span className='text-blue-500'>
                                Low
                            </span>
                        ) : task.priority === 2 ? (
                            <span className='text-green-500'>
                                Medium
                            </span>
                        ) : task.priority === 3 ? (
                            <span className='text-yellow-500'>
                                High
                            </span>
                        ) : (
                            <span className='text-red-500'>
                                Urgent
                            </span>
                        )}</p>
                    )}
                    {task.tags && task.tags.length > 0 && (
                        <div>
                            <strong>Tags:</strong>{" "}
                            <div className="flex flex-wrap gap-2 mt-1">
                                {task.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800 flex items-center gap-2">
                                        <Tag className='w-4 h-4' /> {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {task.createdAt && (
                        <p className="text-sm text-gray-500">
                            Created: {new Date(task.createdAt).toLocaleString()}
                        </p>
                    )}
                    {task.updatedAt && (
                        <p className="text-sm text-gray-500">
                            Last Updated: {new Date(task.updatedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsModal;