import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add defaultProjectId, defaultDueDate, and nextDefaultHour as props
const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, defaultProjectId, defaultDueDate, nextDefaultHour }) => {
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [dueDate, setDueDate] = useState(''); // Stores YYYY-MM-DD string
    const [time, setTime] = useState(''); // Stores HH:MM string
    const [priority, setPriority] = useState(1);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect to fetch user's projects and set default project/due date/time
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found. Please log in again.');
                    return;
                }

                if (defaultProjectId) {
                    setSelectedProjectId(defaultProjectId);
                    setProjects([]); // No need to fetch all projects if defaultProjectId is provided
                } else {
                    const res = await axios.get(`${API_URL}/projects`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const userProjects = res.data || [];
                    setProjects(userProjects);

                    const inboxProject = userProjects.find(p => p.isInbox);
                    if (inboxProject) {
                        setSelectedProjectId(inboxProject._id);
                    } else if (userProjects.length > 0) {
                        setSelectedProjectId(userProjects[0]._id);
                    } else {
                        setError('No projects available.');
                    }
                }
            } catch (err) {
                console.error('Failed to load projects:', err.response?.data?.message || err.message);
                setError(err.response?.data?.message || 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchProjects();

            // Calculate current local date for default
            const now = new Date();
            const todayFormatted = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, '0'),
                String(now.getDate()).padStart(2, '0')
            ].join('-');

            // Set default due date:
            // Prioritize defaultDueDate if it's explicitly provided AND different from today's actual date.
            // Otherwise, always use today's actual date to prevent stale 'yesterday' dates.
            setDueDate(defaultDueDate && defaultDueDate !== todayFormatted ? defaultDueDate : todayFormatted);

            // Set default time based on nextDefaultHour prop (already correctly formatted by parent)
            const formattedHour = String(nextDefaultHour).padStart(2, '0');
            const formattedMinutes = String(now.getMinutes()).padStart(2, '0');
            setTime(`${formattedHour}:${formattedMinutes}`);

            // Reset other form fields when modal opens
            setContent('');
            setDescription('');
            setTags('');
            setPriority(1);
        }
    }, [isOpen, defaultProjectId, defaultDueDate, nextDefaultHour]); // Depend on nextDefaultHour

    const handleCreate = async () => {
        if (!content.trim()) {
            setError('Task content is required');
            return;
        }
        if (!selectedProjectId) {
            setError('Project is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Combine dueDate and time into a single Date object
            let finalDueDate = null;
            if (dueDate) {
                const datePart = dueDate; // YYYY-MM-DD
                const timePart = time || '00:00'; // HH:MM, default to 00:00 if not set
                // Construct a Date object using ISO 8601 format for consistency
                finalDueDate = new Date(`${datePart}T${timePart}:00`);
                // Ensure it's a valid date
                if (isNaN(finalDueDate.getTime())) {
                    setError('Invalid due date or time.');
                    setLoading(false);
                    return;
                }
            }

            const taskData = {
                content,
                description,
                projectId: selectedProjectId,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                dueDate: finalDueDate ? finalDueDate.toISOString() : null, // Send as ISO string or null
                priority
            };
            await onTaskCreated?.(taskData);

            // Reset form fields after successful creation
            setContent('');
            setDescription('');
            setTags('');
            setDueDate(''); // Clear due date after creation
            setTime(''); // Clear time after creation
            setPriority(1);

            onClose();
        } catch (err) {
            console.error('Error preparing task for creation:', err.message);
            setError(err.message || 'Failed to prepare task for creation');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md relative shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

                <input
                    type="text"
                    placeholder="Task Title"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                <textarea
                    placeholder="Description"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />
                <div className="flex gap-2 mb-3">
                    <input
                        type="date"
                        className="w-1/2 border border-gray-300 p-2 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                    />
                    <input
                        type="time"
                        className="w-1/2 border border-gray-300 p-2 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                    />
                </div>
                <select
                    className="w-full border dark:border-zinc-700 dark:bg-zinc-800 p-2 mb-3 rounded dark:focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={priority}
                    onChange={e => setPriority(Number(e.target.value))}
                >
                    <option value={1} className='dark:text-white'>Low</option>
                    <option value={2} className='dark:text-white'>Medium</option>
                    <option value={3} className='dark:text-white'>High</option>
                    <option value={4} className='dark:text-white'>Urgent</option>
                </select>

                {/* Conditional rendering of project selection */}
                {!defaultProjectId && (
                    <select
                        className="w-full border dark:border-zinc-700 dark:bg-zinc-800 border-gray-300 p-2 mb-4 rounded"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        disabled={loading} // Disable during loading
                    >
                        {loading ? (
                            <option>Loading projects...</option>
                        ) : projects.length > 0 ? (
                            projects.map(project => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))
                        ) : (
                            <option value="">No projects found</option>
                        )}
                    </select>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={loading || !selectedProjectId || !content.trim()}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateTaskModal;
