import React, { useState, useRef, useEffect } from 'react'; // Import useRef and useEffect
import axios from 'axios';
import { Search } from 'lucide-react'; // Import the Search icon
import TaskCard from '../../components/common/TaskCard'; // Adjust path as needed
import TaskDetailsModal from '../../components/common/TaskDetailsModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import EditTaskModal from '../../components/common/EditTaskModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // State for managing which task's dropdown is open
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

    // State for task details modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);


    const token = localStorage.getItem('token');

    const handleUpdateTask = (updated) => {
        // Update the task in searchResults directly
        setSearchResults(prev => prev.map(t => t._id === updated._id ? updated : t));
        // No need to call fetchInboxTasks here, as it's not directly related to search results
    }

    const handleDeleteTaskConfirmed = async () => {
        if (!taskToDelete) return;

        try {
            await axios.delete(`${API_URL}/tasks/${taskToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Filter out the deleted task from searchResults
            setSearchResults(prev => prev.filter(t => t._id !== taskToDelete._id));
            setShowDeleteModal(false); // Close the modal
            setTaskToDelete(null); // Clear the task to delete
            // No need to call fetchInboxTasks here
        } catch (err) {
            console.error('Failed to delete task:', err)
            setError(err.response?.data?.message || 'Failed to delete task');
            setShowDeleteModal(false); // Close the modal even on error
            setTaskToDelete(null); // Clear the task to delete
        }
    }

    // Function to perform the search
    const handleSearch = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setError(null);
            return; // Don't search for empty queries
        }

        setLoading(true);
        setError(null);

        try {
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            // Assuming a backend endpoint like /api/tasks/search?query=YOUR_QUERY
            // This endpoint should search both content and tags
            const res = await axios.get(`${API_URL}/tasks/search`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { query: searchQuery } // Pass the search query as a URL parameter
            });
            setSearchResults(res.data);
        } catch (err) {
            console.error('Failed to perform search:', err);
            setError(err.response?.data?.message || 'Failed to perform search. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Effect to handle clicks outside of the dropdown menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the dropdown is open and the click is outside its container, close it
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        // Add event listener when component mounts
        document.addEventListener('mousedown', handleClickOutside);
        // Clean up the event listener when component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]); // Re-run effect if openDropdownId changes

    const handleViewDetails = (task) => {
        setViewingTask(task);
        setShowDetailsModal(true);
        setOpenDropdownId(null); // Close the dropdown menu
    }

    // New toggleComplete function for SearchPage
    const toggleComplete = async (task) => {
        try {
            const endpoint = task.isCompleted ? 'uncomplete' : 'complete';
            const res = await axios.patch(`${API_URL}/tasks/${task._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update the specific task in searchResults to trigger re-render
            setSearchResults(prev =>
                prev.map(t => (t._id === task._id ? res.data : t))
            );
        } catch (err) {
            console.error(`Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`, err);
            setError(err.response?.data?.message || `Failed to ${task.isCompleted ? 'uncomplete' : 'complete'} task`);
        }
    };

    // Function to open the delete confirmation modal
    const confirmDelete = (task) => {
        setTaskToDelete(task); // Store the task to be deleted
        setShowDeleteModal(true); // Open the modal
        setOpenDropdownId(null); // Close the dropdown menu
    }

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <Search className="w-6 h-6" /> Search Tasks
                </h1>
            </div>

            <form onChange={handleSearch} className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by content or tags..."
                    className="flex-grow border p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    disabled={loading}
                >
                    <Search /> {loading ? 'Searching...' : 'Search'}
                </button> */}
            </form>

            {loading && <div className="text-gray-500 text-center text-lg">Searching...</div>}
            {error && <div className="text-red-500 text-center text-lg">{error}</div>}

            {!loading && !error && searchResults.length === 0 && searchQuery.trim() && (
                <div className="text-gray-400 italic text-center text-lg">No tasks found matching your search.</div>
            )}
            {!loading && !error && searchResults.length === 0 && !searchQuery.trim() && (
                <div className="text-gray-400 italic text-center text-lg">Enter a query to search for tasks.</div>
            )}

            {!loading && searchResults.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Search Results ({searchResults.length})</h2>
                    <ul className="space-y-4">
                        {searchResults.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onToggleComplete={toggleComplete}
                                onViewDetails={handleViewDetails}
                                onEditTask={(taskToEdit) => {
                                    setEditingTask(taskToEdit);
                                    setOpenDropdownId(null); // Close dropdown
                                }}
                                onConfirmDelete={confirmDelete}
                                openDropdownId={openDropdownId}
                                setOpenDropdownId={setOpenDropdownId}
                                dropdownRef={dropdownRef}
                            />
                        ))}
                    </ul>
                </div>
            )}
            <EditTaskModal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                task={editingTask}
                onUpdate={handleUpdateTask}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setTaskToDelete(null); // Clear the task when closing
                }}
                onConfirm={handleDeleteTaskConfirmed}
                title="Delete Task"
                message={taskToDelete ? `Are you sure you want to delete the task "${taskToDelete.content}"? This action cannot be undone.` : "Are you sure you want to delete this task? This action cannot be undone."}
            />

            <TaskDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setViewingTask(null); // Clear the task when closing
                }}
                task={viewingTask}
            />
        </div>
    );
};

export default SearchPage;
