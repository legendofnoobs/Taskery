import React, { useState } from 'react';
import { MoreVertical, Trash2, Edit } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const truncateContent = (content, maxLength) => {
        if (content.length <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white dark:bg-zinc-800 dark:text-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-bold mb-2">{note.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{truncateContent(note.content, 100)}</p>
                </div>
                <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                        <MoreVertical size={20} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 dark:bg-zinc-700 dark:text-white dark:border-zinc-700 rounded-md shadow-lg z-10 py-1">
                            <button
                                onClick={() => { onEdit(note); setDropdownOpen(false); }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-600"
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                onClick={() => { onDelete(note); setDropdownOpen(false); }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
