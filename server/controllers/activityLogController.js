import ActivityLog from "../models/ActivityLog.js";

// Create activity log manually if needed
export async function createLog(req, res) {
    try {
        const { action, entityType, entityId, details } = req.body;

        const log = await ActivityLog.create({
            userId: req.user._id,
            action,
            entityType,
            entityId,
            details,
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: "Failed to create log", error });
    }
}

// Get all logs for the logged-in user
export async function getMyLogs(req, res) {
    try {
        const logs = await ActivityLog.find({ userId: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to get logs", error });
    }
}

// Get logs for a specific entity (task/project)
export async function getLogsByEntity(req, res) {
    try {
        const { entityId } = req.params;

        const logs = await ActivityLog.find({
            userId: req.user._id,
            entityId,
        }).sort({ createdAt: -1 });

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to get logs by entity", error });
    }
}

export async function deleteAllMyLogs(req, res) {
    try {
        const result = await ActivityLog.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: `Deleted ${result.deletedCount} logs.`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete all logs", error });
    }
}