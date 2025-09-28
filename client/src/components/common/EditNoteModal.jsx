import React, { useState, useEffect } from 'react';

const EditNoteModal = ({ isOpen, onClose, onNoteUpdated, note }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
        }
    }, [note]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!title.trim()) {
            setError('Note title cannot be empty.');
            setLoading(false);
            return;
        }

        try {
            await onNoteUpdated({ ...note, title, content });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update note.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-xl w-full max-w-3xl mx-4">
                <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            id="noteTitle"
                            className="mt-1 block w-full border-none rounded-md p-2 focus:outline-none focus:border-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Meeting notes, ideas"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <textarea
                            id="noteContent"
                            className="mt-1 block w-full border-none rounded-md p-2 focus:outline-none focus:border-none h-96 resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your note here..."
                            rows="4"
                            disabled={loading}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md dark:text-white hover:bg-gray-300 transition-colors dark:hover:bg-zinc-700 dark:bg-zinc-600"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNoteModal;
