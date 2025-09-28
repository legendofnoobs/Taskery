import Task from '../models/Task.js';
import Note from '../models/Note.js';

export const searchAll = async (req, res) => {
    const { query } = req.query;
    const ownerId = req.user._id;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        const tasks = await Task.find({
            ownerId,
            $text: { $search: query }
        });

        const notes = await Note.find({
            ownerId,
            $text: { $search: query }
        });

        const results = [
            ...tasks.map(task => ({ ...task.toObject(), type: 'task' })),
            ...notes.map(note => ({ ...note.toObject(), type: 'note' }))
        ];

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Search failed', error });
    }
};
