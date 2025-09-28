import Note from '../models/Note.js';

// Create a new note
export async function createNote(req, res) {
    try {
        const { title, content } = req.body;

        const newNote = await Note.create({
            title,
            content,
            ownerId: req.user._id,
        });

        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create note', error });
    }
}

// Get all notes of the user
export async function getNotes(req, res) {
    try {
        const notes = await Note.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get notes', error });
    }
}

// Get single note
export async function getNoteById(req, res) {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            ownerId: req.user._id,
        });

        if (!note) return res.status(404).json({ message: 'Note not found' });

        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get note', error });
    }
}

// Update note
export async function updateNote(req, res) {
    try {
        const updated = await Note.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            req.body,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'Note not found' });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update note', error });
    }
}

// Delete note
export async function deleteNote(req, res) {
    try {
        const deleted = await Note.findOneAndDelete({
            _id: req.params.id,
            ownerId: req.user._id,
        });

        if (!deleted) return res.status(404).json({ message: 'Note not found' });

        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete note', error });
    }
}
