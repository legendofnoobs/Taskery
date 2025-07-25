// import { useState, useEffect } from 'react'
// import axios from 'axios'

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
//     const [content, setContent] = useState('')
//     const [description, setDescription] = useState('')
//     const [tags, setTags] = useState('')
//     const [dueDate, setDueDate] = useState('')
//     const [priority, setPriority] = useState(1)
//     const [projects, setProjects] = useState([])
//     const [selectedProjectId, setSelectedProjectId] = useState('')
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState(null)

//     // Fetch user's projects
//     useEffect(() => {
//         const fetchProjects = async () => {
//             try {
//                 const token = localStorage.getItem('token')
//                 // Always ensure you have a token before making authenticated requests
//                 if (!token) {
//                     setError('Authentication token not found. Please log in again.')
//                     setLoading(false)
//                     return;
//                 }

//                 const res = await axios.get(`${API_URL}/projects`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 })

//                 const userProjects = res.data || []

//                 setProjects(userProjects)

//                 // If no projects are returned, or if you want to explicitly default to inbox
//                 // even if other projects exist, you might adjust this logic.
//                 // Currently, it defaults to the first project if available, otherwise inbox.
//                 if (userProjects.length > 0) {
//                     setSelectedProjectId(userProjects[0]._id)
//                 } else {
//                     // Fallback to inbox project if no other projects are available
//                     const inboxRes = await axios.get(`${API_URL}/projects/inbox`, {
//                         headers: {
//                             Authorization: `Bearer ${token}`
//                         }
//                     })

//                     if (inboxRes.data?._id) {
//                         setSelectedProjectId(inboxRes.data._id)
//                         setProjects([inboxRes.data]) // Set only the inbox project if no others
//                     } else {
//                         // Handle case where inbox project also isn't found
//                         setError('No projects available and Inbox project not found.')
//                     }
//                 }
//             } catch (err) {
//                 console.error('Failed to load projects:', err.response?.data?.message || err.message)
//                 setError(err.response?.data?.message || 'Failed to load projects')
//             } finally {
//                 // Ensure loading is set to false regardless of success or failure
//                 setLoading(false)
//             }
//         }

//         if (isOpen) {
//             setLoading(true); // Set loading when modal opens and fetch starts
//             setError(null);    // Clear previous errors
//             fetchProjects()
//         }
//     }, [isOpen]) // 'token' is accessed inside 'fetchProjects', and 'fetchProjects' itself
//     // is stable across renders (unless you put it inside useEffect, which
//     // would require it in the deps array). As it's defined outside, it's fine.


//     const handleCreate = async () => {
//         if (!content.trim()) { // Use .trim() to prevent empty strings with whitespace
//             setError('Task content is required');
//             return;
//         }
//         if (!selectedProjectId) {
//             setError('Project is required');
//             return;
//         }

//         setLoading(true);
//         setError(null); // Clear any previous errors

//         try {
//             // Instead of making the API call here, we construct the task data
//             // and pass it to the parent component via the onTaskCreated prop.
//             // The parent component (InboxPage) will then handle the API call.
//             const taskData = {
//                 content,
//                 description,
//                 projectId: selectedProjectId,
//                 tags: tags.split(',').map(t => t.trim()).filter(Boolean),
//                 dueDate,
//                 priority
//             };

//             // Call the callback function provided by the parent
//             // The parent is responsible for the actual API call and handling its response
//             await onTaskCreated?.(taskData); // Pass taskData, not response.data

//             // Reset form fields after successful creation (or after parent handles it)
//             setContent('');
//             setDescription('');
//             setTags('');
//             setDueDate('');
//             setPriority(1);
//             // setSelectedProjectId(''); // Keep selected project ID or reset based on UX needs

//             onClose(); // Close the modal
//         } catch (err) {
//             // This catch block will now handle errors from the parent's onTaskCreated if it throws
//             console.error('Error preparing task for creation:', err.message);
//             setError(err.message || 'Failed to prepare task for creation');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
//                 <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

//                 {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

//                 <input
//                     type="text"
//                     placeholder="Task content"
//                     className="w-full border p-2 mb-3 rounded"
//                     value={content}
//                     onChange={e => setContent(e.target.value)}
//                 />
//                 <textarea
//                     placeholder="Description"
//                     className="w-full border p-2 mb-3 rounded"
//                     rows="3"
//                     value={description}
//                     onChange={e => setDescription(e.target.value)}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Tags (comma separated)"
//                     className="w-full border p-2 mb-3 rounded"
//                     value={tags}
//                     onChange={e => setTags(e.target.value)}
//                 />
//                 <input
//                     type="date"
//                     className="w-full border p-2 mb-3 rounded"
//                     value={dueDate}
//                     onChange={e => setDueDate(e.target.value)}
//                 />
//                 <select
//                     className="w-full border p-2 mb-3 rounded"
//                     value={priority}
//                     onChange={e => setPriority(Number(e.target.value))}
//                 >
//                     <option value={1}>Low</option>
//                     <option value={2}>Medium</option>
//                     <option value={3}>High</option>
//                     <option value={4}>Urgent</option>
//                 </select>

//                 <select
//                     className="w-full border p-2 mb-4 rounded"
//                     value={selectedProjectId}
//                     onChange={e => setSelectedProjectId(e.target.value)}
//                 >
//                     {loading ? (
//                         <option>Loading projects...</option>
//                     ) : projects.length > 0 ? (
//                         projects.map(project => (
//                             <option key={project._id} value={project._id}>
//                                 {project.name}
//                             </option>
//                         ))
//                     ) : (
//                         <option value="">No projects found</option>
//                     )}
//                 </select>

//                 <div className="flex justify-end gap-3">
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleCreate}
//                         disabled={loading || !selectedProjectId || !content.trim()} // Disable if no project selected or content is empty
//                         className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//                     >
//                         {loading ? 'Creating...' : 'Create Task'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default CreateTaskModal

// src/components/common/CreateTaskModal.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Add defaultProjectId as a prop
const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, defaultProjectId }) => {
    const [content, setContent] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [priority, setPriority] = useState(1)
    const [projects, setProjects] = useState([])
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Effect to fetch user's projects or set default project
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    setError('Authentication token not found. Please log in again.')
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
        }
    }, [isOpen, defaultProjectId]); // Depend on isOpen and defaultProjectId

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
                dueDate,
                priority
            };
            await onTaskCreated?.(taskData);

            setContent('');
            setDescription('');
            setTags('');
            setDueDate('');
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
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                <textarea
                    placeholder="Description"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700"
                    rows="3"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />
                <input
                    type="date"
                    className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                />
                <select
                    className="w-full border border-gray-300 dark:bg-zinc-800 p-2 mb-3 rounded dark:border-zinc-700"
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