import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const EditTaskModal = ({ isOpen, onClose, task, onUpdate }) => {
    const [content, setContent] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [time, setTime] = useState('') // New state for time
    const [priority, setPriority] = useState(1)
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (task) {
            setContent(task.content || '')
            setDescription(task.description || '')
            setTags(task.tags?.join(', ') || '')
            
            // Extract date and time from task.dueDate
            if (task.dueDate) {
                const taskDate = new Date(task.dueDate);
                setDueDate(taskDate.toISOString().slice(0, 10)); // YYYY-MM-DD
                // Format time as HH:MM
                const hours = taskDate.getHours().toString().padStart(2, '0');
                const minutes = taskDate.getMinutes().toString().padStart(2, '0');
                setTime(`${hours}:${minutes}`);
            } else {
                setDueDate('');
                setTime('');
            }

            setPriority(task.priority || 1)
            setSelectedProjectId(task.projectId || '')
        }
    }, [task])

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await axios.get(`${API_URL}/projects`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setProjects(res.data)
            } catch (err) {
                console.error(err)
                setError('Failed to load projects')
            }
        }

        if (isOpen) {
            fetchProjects()
        }
    }, [isOpen])

    const handleUpdate = async () => {
        if (!content || !selectedProjectId) {
            setError('Content and project are required')
            return
        }

        setLoading(true)
        setError(null); // Clear previous errors
        const token = localStorage.getItem('token')

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

            const response = await axios.put(`${API_URL}/tasks/${task._id}`, {
                content,
                description,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                dueDate: finalDueDate ? finalDueDate.toISOString() : null, // Send as ISO string or null
                priority,
                projectId: selectedProjectId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            onUpdate(response.data)
            onClose()
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Failed to update task')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl dark:bg-zinc-800">
                <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

                <input className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={content} onChange={e => setContent(e.target.value)} placeholder="Task content" />
                <textarea className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
                <input className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" />
                
                <div className="flex gap-2 mb-3"> {/* Flex container for date and time inputs */}
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

                <select className="w-full border border-gray-300 p-2 mb-3 rounded dark:border-zinc-700 dark:bg-zinc-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={priority} onChange={e => setPriority(Number(e.target.value))}>
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                    <option value={4}>Urgent</option>
                </select>
                <select className="w-full border border-gray-300 p-2 mb-4 rounded dark:border-zinc-700 dark:bg-zinc-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                    {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-600">Cancel</button>
                    <button onClick={handleUpdate} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditTaskModal
