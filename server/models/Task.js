import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    content: { type: String, required: true },
    description: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    priority: { type: Number, default: 1 }, // 1-4
    dueDate: { type: Date },
    dueTime: { type: String }, // or Date if needed
    isCompleted: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    tags: {
        type: [String], // Defines an array of strings
        default: []     // Optional: ensures it's always an array, even if empty
    },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // for subtasks
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;