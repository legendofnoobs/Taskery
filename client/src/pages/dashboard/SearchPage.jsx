import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../../components/common/TaskCard';
import NoteCard from '../../components/common/NoteCard';
import { useSearch } from '../../hooks/useSearch';
import EditTaskModal from '../../components/common/EditTaskModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import EditNoteModal from '../../components/common/EditNoteModal';

const SearchPage = () => {
    const {
        searchQuery,
        searchResults,
        loading,
        error,
        handleSearchChange,
        updateSearchResult,
        deleteSearchResult,
        toggleComplete,
    } = useSearch();

    const navigate = useNavigate();

    const [editingTask, setEditingTask] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [editingNote, setEditingNote] = useState(null);

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId]);

    const taskResults = searchResults.filter(result => result.type === 'task');
    const noteResults = searchResults.filter(result => result.type === 'note');

    const handleEdit = (item) => {
        if (item.type === 'task') {
            setEditingTask(item);
        } else {
            setEditingNote(item);
        }
    };

    const handleDelete = (item) => {
        setDeletingItem(item);
    };

    const confirmDelete = () => {
        if (deletingItem) {
            deleteSearchResult(deletingItem);
            setDeletingItem(null);
        }
    };

    const handleUpdate = (updatedItem) => {
        const originalItem = editingTask || editingNote;
        updateSearchResult({ ...updatedItem, type: originalItem.type });
    };

    const handleViewDetails = (task) => {
        navigate(`/dashboard/projects?projectId=${task.projectId}&taskId=${task._id}`);
    };

    return (
        <div className="md:ml-72 mt-8 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                    <Search className="w-6 h-6 text-gray-800 dark:text-white" /> Search
                </h1>
            </div>

            <form className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Search for tasks or notes..."
                    className="flex-grow border p-3 rounded-lg shadow-sm border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </form>

            {loading && <div className="text-gray-500 dark:text-gray-400 text-center text-lg">Searching...</div>}
            {error && <div className="text-red-500 dark:text-red-400 text-center text-lg">{error}</div>}

            {!loading && !error && searchResults.length === 0 && searchQuery.trim() && (
                <div className="text-gray-400 dark:text-gray-500 italic text-center text-lg">No results found.</div>
            )}
            {!loading && !error && searchResults.length === 0 && !searchQuery.trim() && (
                <div className="text-gray-400 dark:text-gray-500 italic text-center text-lg">Enter a query to search.</div>
            )}

            {!loading && searchResults.length > 0 && (
                <div className="space-y-8">
                    {taskResults.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Tasks ({taskResults.length})</h2>
                            <ul className="space-y-4">
                                {taskResults.map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onToggleComplete={() => toggleComplete(task)}
                                        onViewDetails={() => handleViewDetails(task)}
                                        onEditTask={() => handleEdit(task)}
                                        onConfirmDelete={() => handleDelete(task)}
                                        openDropdownId={openDropdownId}
                                        setOpenDropdownId={setOpenDropdownId}
                                        dropdownRef={dropdownRef}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                    {noteResults.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Notes ({noteResults.length})</h2>
                            <ul className="space-y-4">
                                {noteResults.map((note) => (
                                    <NoteCard
                                        key={note._id}
                                        note={note}
                                        onEdit={() => handleEdit(note)}
                                        onDelete={() => handleDelete(note)}
                                        openDropdownId={openDropdownId}
                                        setOpenDropdownId={setOpenDropdownId}
                                        dropdownRef={dropdownRef}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {editingTask && (
                <EditTaskModal
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    onUpdate={handleUpdate}
                />
            )}

            {editingNote && (
                <EditNoteModal
                    isOpen={!!editingNote}
                    onClose={() => setEditingNote(null)}
                    note={editingNote}
                    onNoteUpdated={handleUpdate}
                />
            )}

            {deletingItem && (
                <DeleteConfirmationModal
                    isOpen={!!deletingItem}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={confirmDelete}
                    title={`Delete ${deletingItem.type}`}
                    message={`Are you sure you want to delete this ${deletingItem.type}?`}
                />
            )}
        </div>
    );
};

export default SearchPage;
