import Project from "../models/Project.js";
import ActivityLog from "../models/ActivityLog.js";

async function logActivity({ userId, action, targetType = "Project", targetId }) {
    await ActivityLog.create({
        userId,
        action,
        targetType,
        targetId,
        timestamp: new Date(),
    });
}

// Create a new project
export async function createProject(req, res) {
    try {
        const { name, color, isFavorite = false } = req.body;

        const newProject = await Project.create({
            name,
            color,
            isFavorite,
            userId: req.user._id,
        });

        // Log activity
        await logActivity({
            userId: req.user._id,
            action: "create",
            entityType: "project",
            entityId: newProject._id,
            description: `Created project "${newProject.name}"`,
        });

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: "Failed to create project", error });
    }
}

// Get all projects of the user
export async function getProjects(req, res) {
    try {
        const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Failed to get projects", error });
    }
}

// Get single project
export async function getProjectById(req, res) {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!project) return res.status(404).json({ message: "Project not found" });

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: "Failed to get project", error });
    }
}

// Update project
export async function updateProject(req, res) {
    try {
        const updated = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Project not found" });

        // Log activity
        await logActivity({
            userId: req.user._id,
            action: "update",
            entityType: "project",
            entityId: updated._id,
            description: `Updated project "${updated.name}"`,
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update project", error });
    }
}

// Delete project
export async function deleteProject(req, res) {
    try {
        const deleted = await Project.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!deleted) return res.status(404).json({ message: "Project not found" });

        // Log activity
        await logActivity({
            userId: req.user._id,
            action: "delete",
            entityType: "project",
            entityId: deleted._id,
            description: `Deleted project "${deleted.name}"`,
        });

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete project", error });
    }
}

export async function favoriteProject(req, res) {
    try {
        const updated = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isFavorite: true },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Project not found" });

        // Log activity
        await logActivity({
            userId: req.user._id,
            action: "update",
            entityType: "project",
            entityId: updated._id,
            description: `Favored project "${updated.name}"`,
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to favorite project", error });
    }
}

// Unfavorite a project
export async function unfavoriteProject(req, res) {
    try {
        const updated = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isFavorite: false },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Project not found" });

        // Log activity
        await logActivity({
            userId: req.user._id,
            action: "update",
            entityType: "project",
            entityId: updated._id,
            description: `Unfavored project "${updated.name}"`,
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to unfavorite project", error });
    }
}