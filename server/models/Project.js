import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, default: 'gray' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isFavorite: { type: Boolean, default: false },
    isInbox: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;