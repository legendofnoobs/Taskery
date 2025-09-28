import React, { useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import CreateNoteModal from '../../components/common/CreateNoteModal';
import EditNoteModal from '../../components/common/EditNoteModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import NoteCard from '../../components/common/NoteCard';
import { ArrowLeft, BadgePlus, FileText } from 'lucide-react';

function NotesPage() {
    const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const handleEdit = (note) => {
        setSelectedNote(note);
        setEditModalOpen(true);
    };

    const handleDelete = (note) => {
        setSelectedNote(note);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedNote) {
            deleteNote(selectedNote._id);
            setDeleteModalOpen(false);
            setSelectedNote(null);
        }
    };

    return (
        <div className='md:ml-72 mt-8 px-4 py-6'>
            <div className="fixed top-0 left-0 right-0 md:left-72 z-10 bg-white/50 dark:bg-zinc-900/50 px-4 py-6 flex items-center justify-between backdrop-blur-md">
                <div className='flex items-center gap-2'>
                    <button className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-2 block md:hidden" aria-label="Back to Inbox">
                        <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"> <FileText className="w-6 h-6"/> Notes</h1>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 font-bold px-2 py-2 lg:px-4 rounded-full disabled:opacity-50 gap-x-3 hover:bg-zinc-300 dark:hover:bg-zinc-100/10 transition-colors text-sm whitespace-nowrap"
                >
                    <BadgePlus className="w-4 h-4" />
                    Create Note
                </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-10 pb-18">
                {notes.map(note => (
                    <NoteCard
                        key={note._id}
                        note={note}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
            <CreateNoteModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onNoteCreated={createNote}
            />
            {selectedNote && (
                <EditNoteModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onNoteUpdated={updateNote}
                    note={selectedNote}
                />
            )}
            {selectedNote && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Note"
                    message={`Are you sure you want to delete the note "${selectedNote.title}"?`}
                />
            )}
        </div>
    );
}

export default NotesPage;
