import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react'; // Import the Search icon
import TaskCard from '../../components/common/TaskCard'; // Adjust path as needed
import TaskDetailsModal from '../../components/common/TaskDetailsModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import EditTaskModal from '../../components/common/EditTaskModal';
import { useSearchTasks } from '../../hooks/useSearchTasks'; // Import the new hook

const SearchPage = () => {
    // Use the custom hook for search logic and task manipulations
    const {
        searchQuery,
        searchResults,
        loading,
        error,
        handleSearchChange,
        handleUpdateTask,
        handleDeleteTaskConfirmed,
        toggleComplete,
    } = useSearchTasks();

    // State for modals
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // State for managing which task's dropdown is open
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

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

    /**
     * Sets the task to be viewed in detail and opens the details modal.
     * @param {object} task - The task object to view details for.
     */
    const handleViewDetails = (task) => {
        setViewingTask(task);
        setShowDetailsModal(true);
        setOpenDropdownId(null); // Close the dropdown menu
    };

    /**
     * Function to open the delete confirmation modal.
     * @param {object} task - The task object to confirm deletion for.
     */
    const confirmDelete = (task) => {
        setTaskToDelete(task); // Store the task to be deleted
        setShowDeleteModal(true); // Open the modal
        setOpenDropdownId(null); // Close the dropdown menu
    };

    /**
     * Executes the task deletion after confirmation.
     */
    const onDeleteConfirmed = async () => {
        if (taskToDelete) {
            await handleDeleteTaskConfirmed(taskToDelete._id);
            setShowDeleteModal(false); // Close the modal
            setTaskToDelete(null); // Clear the task to delete
        }
    };

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                    <Search className="w-6 h-6 text-gray-800 dark:text-white" /> Search Tasks
                </h1>
            </div>

            <form className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by content or tags..."
                    className="flex-grow border p-3 rounded-lg shadow-sm border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
                    value={searchQuery}
                    onChange={handleSearchChange} // Use the hook's handler
                />
            </form>

            {loading && <div className="text-gray-500 dark:text-gray-400 text-center text-lg">Searching...</div>}
            {error && <div className="text-red-500 dark:text-red-400 text-center text-lg">{error}</div>}

            {!loading && !error && searchResults.length === 0 && searchQuery.trim() && (
                <div className="text-gray-400 dark:text-gray-500 italic text-center text-lg">No tasks found matching your search.</div>
            )}
            {!loading && !error && searchResults.length === 0 && !searchQuery.trim() && (
                <div className="text-gray-400 dark:text-gray-500 italic text-center text-lg">Enter a query to search for tasks.</div>
            )}

            {!loading && searchResults.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Search Results ({searchResults.length})</h2>
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
                onConfirm={onDeleteConfirmed}
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
