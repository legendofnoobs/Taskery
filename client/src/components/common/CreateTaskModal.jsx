// import { useState, useEffect } from 'react'
// import axios from 'axios'

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// // Add defaultProjectId as a prop
// const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, defaultProjectId }) => {
//     const [content, setContent] = useState('')
//     const [description, setDescription] = useState('')
//     const [tags, setTags] = useState('')
//     const [dueDate, setDueDate] = useState('')
//     const [priority, setPriority] = useState(1)
//     const [projects, setProjects] = useState([])
//     const [selectedProjectId, setSelectedProjectId] = useState('')
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState(null)

//     // Effect to fetch user's projects or set default project
//     useEffect(() => {
//         const fetchProjects = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const token = localStorage.getItem('token')
//                 if (!token) {
//                     setError('Authentication token not found. Please log in again.')
//                     return;
//                 }

//                 if (defaultProjectId) {
//                     // If defaultProjectId is provided, use it directly
//                     setSelectedProjectId(defaultProjectId);
//                     setProjects([]); // No need to fetch projects if one is already set
//                 } else {
//                     // Otherwise, fetch all projects
//                     const res = await axios.get(`${API_URL}/projects`, {
//                         headers: { Authorization: `Bearer ${token}` }
//                     });
//                     const userProjects = res.data || [];
//                     setProjects(userProjects);

//                     // Set default selected project: inbox if available, otherwise the first project
//                     const inboxProject = userProjects.find(p => p.isInbox);
//                     if (inboxProject) {
//                         setSelectedProjectId(inboxProject._id);
//                     } else if (userProjects.length > 0) {
//                         setSelectedProjectId(userProjects[0]._id);
//                     } else {
//                         setError('No projects available.');
//                     }
//                 }
//             } catch (err) {
//                 console.error('Failed to load projects:', err.response?.data?.message || err.message);
//                 setError(err.response?.data?.message || 'Failed to load projects');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (isOpen) {
//             fetchProjects();
//         }
//     }, [isOpen, defaultProjectId]); // Depend on isOpen and defaultProjectId

//     const handleCreate = async () => {
//         if (!content.trim()) {
//             setError('Task content is required');
//             return;
//         }
//         if (!selectedProjectId) {
//             setError('Project is required');
//             return;
//         }

//         setLoading(true);
//         setError(null);

//         try {
//             const taskData = {
//                 content,
//                 description,
//                 projectId: selectedProjectId,
//                 tags: tags.split(',').map(t => t.trim()).filter(Boolean),
//                 dueDate,
//                 priority
//             };
//             await onTaskCreated?.(taskData);

//             setContent('');
//             setDescription('');
//             setTags('');
//             setDueDate('');
//             setPriority(1);

//             onClose();
//         } catch (err) {
//             console.error('Error preparing task for creation:', err.message);
//             setError(err.message || 'Failed to prepare task for creation');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md relative shadow-xl">
//                 <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

//                 {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

//                 <input
//                     type="text"
//                     placeholder="Task Title"
//                     className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={content}
//                     onChange={e => setContent(e.target.value)}
//                 />
//                 <textarea
//                     placeholder="Description"
//                     className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     rows="3"
//                     value={description}
//                     onChange={e => setDescription(e.target.value)}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Tags (comma separated)"
//                     className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={tags}
//                     onChange={e => setTags(e.target.value)}
//                 />
//                 <input
//                     type="date"
//                     className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={dueDate}
//                     onChange={e => setDueDate(e.target.value)}
//                 />
//                 <select
//                     className="w-full border border-gray-300 dark:bg-zinc-800 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={priority}
//                     onChange={e => setPriority(Number(e.target.value))}
//                 >
//                     <option value={1} className='dark:text-white'>Low</option>
//                     <option value={2} className='dark:text-white'>Medium</option>
//                     <option value={3} className='dark:text-white'>High</option>
//                     <option value={4} className='dark:text-white'>Urgent</option>
//                 </select>

//                 {/* Conditional rendering of project selection */}
//                 {!defaultProjectId && (
//                     <select
//                         className="w-full border dark:border-zinc-700 dark:bg-zinc-800 border-gray-300 p-2 mb-4 rounded"
//                         value={selectedProjectId}
//                         onChange={e => setSelectedProjectId(e.target.value)}
//                         disabled={loading} // Disable during loading
//                     >
//                         {loading ? (
//                             <option>Loading projects...</option>
//                         ) : projects.length > 0 ? (
//                             projects.map(project => (
//                                 <option key={project._id} value={project._id}>
//                                     {project.name}
//                                 </option>
//                             ))
//                         ) : (
//                             <option value="">No projects found</option>
//                         )}
//                     </select>
//                 )}

//                 <div className="flex justify-end gap-3">
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleCreate}
//                         disabled={loading || !selectedProjectId || !content.trim()}
//                         className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//                     >
//                         {loading ? 'Creating...' : 'Create Task'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default CreateTaskModal;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Removed DatePicker and its CSS import as it's not used in this version of the modal
// import { X, Calendar, Tag, Flag } from 'lucide-react'; // Removed unused imports as per provided code

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add defaultProjectId as a prop
const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, defaultProjectId, defaultDueDate }) => { // Added defaultDueDate prop
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [dueDate, setDueDate] = useState(''); // Stores YYYY-MM-DD string
    const [priority, setPriority] = useState(1);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect to fetch user's projects and set default project/due date
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
                    // If defaultProjectId is provided, use it directly
                    setSelectedProjectId(defaultProjectId);
                    setProjects([]); // No need to fetch projects if one is already set
                } else {
                    // Otherwise, fetch all projects
                    const res = await axios.get(`${API_URL}/projects`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const userProjects = res.data || [];
                    setProjects(userProjects);

                    // Set default selected project: inbox if available, otherwise the first project
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
            // Set default due date to today if defaultDueDate prop is provided
            if (defaultDueDate) {
                setDueDate(defaultDueDate);
            } else {
                // Optionally, set to empty string if no default is desired and modal is opened
                setDueDate('');
            }
            // Reset other form fields when modal opens
            setContent('');
            setDescription('');
            setTags('');
            setPriority(1);
        }
    }, [isOpen, defaultProjectId, defaultDueDate]); // Depend on isOpen, defaultProjectId, and defaultDueDate

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
            const taskData = {
                content,
                description,
                projectId: selectedProjectId,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                dueDate, // dueDate is already in YYYY-MM-DD format
                priority
            };
            await onTaskCreated?.(taskData);

            // Reset form fields after successful creation
            setContent('');
            setDescription('');
            setTags('');
            setDueDate(''); // Clear due date after creation
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
                    type="text" // Changed to text to allow placeholder for date, or keep as date if you want native picker
                    placeholder="Tags (comma separated)"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />
                <input
                    type="date"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                />
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
