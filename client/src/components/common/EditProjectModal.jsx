import React, { useState, useEffect } from 'react';

/**
 * Modal component for editing an existing project.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal is closed.
 * @param {object} props.project - The project object to be edited.
 * @param {function} props.onUpdate - Callback function when a project is successfully updated.
 */
const EditProjectModal = ({ isOpen, onClose, project, onUpdate }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('gray');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Array of available colors for selection
    const colors = ['gray', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'teal'];

    // Populate form fields when the modal opens or project prop changes
    useEffect(() => {
        if (isOpen && project) {
            setName(project.name);
            setColor(project.color || 'gray'); // Default to gray if color is not set
        }
    }, [isOpen, project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name.trim()) {
            setError('Project name cannot be empty.');
            setLoading(false);
            return;
        }

        try {
            // Call the parent's onUpdate prop with the updated project data
            await onUpdate({ ...project, name, color });
            onClose(); // Close modal on success
        } catch (err) {
            // Error handling is typically done in the parent component (Projects.jsx)
            // but we can set a local error message if needed for immediate feedback.
            setError(err.message || 'Failed to update project.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !project) return null; // Ensure project data is available when modal is open

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 dark:bg-zinc-800 dark:text-white">
                <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="editProjectName" className="block text-sm font-medium dark:text-white text-gray-700">Project Name</label>
                        <input
                            type="text"
                            id="editProjectName"
                            className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Work Tasks, Personal Goals"
                            required
                            disabled={loading || project.isInbox} // Disable editing name for Inbox
                        />
                        {project.isInbox && (
                            <p className="text-sm text-gray-500 mt-1">Inbox project name cannot be changed.</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="editProjectColor" className="block text-sm font-medium dark:text-white text-gray-700">Project Color</label>
                        <select
                            id="editProjectColor"
                            className="mt-1 block w-full border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            disabled={loading || project.isInbox} // Disable editing color for Inbox
                        >
                            {colors.map((c) => (
                                <option key={c} value={c}>
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </option>
                            ))}
                        </select>
                        {project.isInbox && (
                            <p className="text-sm text-gray-500 mt-1">Inbox project color cannot be changed.</p>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-700 dark:bg-zinc-600 dark:text-white transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={loading || project.isInbox} // Disable saving for Inbox
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProjectModal;
