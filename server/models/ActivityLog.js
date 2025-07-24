import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true }, // e.g., "Created Task", "Deleted Project"
        entityType: { type: String }, // e.g., "Task", "Project"
        entityId: { type: mongoose.Schema.Types.ObjectId },
        details: { type: String }, // optional description or context
    },
    { timestamps: true }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;