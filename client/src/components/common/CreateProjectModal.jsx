import React, { useState } from 'react';

/**
 * Modal component for creating a new project.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal is closed.
 * @param {function} props.onProjectCreated - Callback function when a project is successfully created.
 */
const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('gray'); // Default color
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Array of available colors for selection
    const colors = ['gray', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'teal'];

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
            // Call the parent's onProjectCreated prop with the new project data
            await onProjectCreated({ name, color });
            // Reset form fields
            setName('');
            setColor('gray');
            onClose(); // Close modal on success
        } catch (err) {
            // Error handling is typically done in the parent component (Projects.jsx)
            // but we can set a local error message if needed for immediate feedback.
            setError(err.message || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
                        <input
                            type="text"
                            id="projectName"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Work Tasks, Personal Goals"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="projectColor" className="block text-sm font-medium text-gray-700">Project Color</label>
                        <select
                            id="projectColor"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            disabled={loading}
                        >
                            {colors.map((c) => (
                                <option key={c} value={c}>
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
