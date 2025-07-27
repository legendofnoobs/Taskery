import Task from "../models/Task.js";
import ActivityLog from "../models/ActivityLog.js";
import mongoose from 'mongoose'; // Import mongoose to use ObjectId for comparisons

// Helper to log activity
async function logActivity({ userId, action, entityType = "task", targetId }) {
    await ActivityLog.create({
        userId,
        action,
        entityType,
        targetId,
        timestamp: new Date(),
    });
}

// Create a new task
export async function createTask(req, res) {
    try {
        const {
            content,
            description,
            projectId,
            priority,
            dueDate,
            tags = [],
            order,
            parentId,
        } = req.body;

        const task = await Task.create({
            content,
            description,
            projectId,
            ownerId: req.user._id,
            priority,
            dueDate,
            tags,
            order,
            parentId: parentId || null,
        });

        await logActivity({
            userId: req.user._id,
            action: `created: ${content}`,
            targetId: task._id,
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: "Failed to create task", error });
    }
}

// Get all tasks for a project, with optional parentId filtering
// MODIFIED: Now includes subtaskCount for top-level tasks
export async function getTasksByProject(req, res) {
    try {
        const { projectId } = req.params;
        const { parentId } = req.query; // Get the parentId query parameter

        let query = {
            projectId: new mongoose.Types.ObjectId(projectId), // Ensure projectId is an ObjectId
            ownerId: req.user._id,
        };

        if (parentId === 'null' || parentId === undefined) {
            query.parentId = null; // Filter for top-level tasks
        } else if (parentId) {
            query.parentId = new mongoose.Types.ObjectId(parentId); // Filter by specific parentId
        }

        let tasks = await Task.find(query).sort({ order: 1, createdAt: -1 }).lean();

        if (parentId === 'null' || parentId === undefined) {
            tasks = await Promise.all(tasks.map(async (task) => {
                const subtaskCount = await Task.countDocuments({
                    parentId: task._id,
                    ownerId: req.user._id // Ensure we only count subtasks owned by the user
                });
                return { ...task, subtaskCount }; // Add subtaskCount to the task object
            }));
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Failed to get tasks for project:', error); // Log the actual error
        res.status(500).json({ message: "Failed to get tasks", error: error.message }); // Send error message
    }
}

// Get a single task
export async function getTaskById(req, res) {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            ownerId: req.user._id,
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Failed to get task", error });
    }
}

// Update task
export async function updateTask(req, res) {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            req.body,
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        await logActivity({
            userId: req.user._id,
            action: "updated task",
            targetId: task._id,
        });

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Failed to update task", error });
    }
}

// Delete task
export async function deleteTask(req, res) {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            ownerId: req.user._id,
        });

        if (!task) return res.status(404).json({ message: "Task not found" });

        await logActivity({
            userId: req.user._id,
            action: "deleted task",
            targetId: task._id,
        });

        res.status(200).json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete task", error });
    }
}

// Search tasks by tag
export async function searchByTag(req, res) {
    try {
        const tag = req.query.tag;

        const tasks = await Task.find({
            ownerId: req.user._id,
            tags: { $in: [tag] },
        });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Failed to search tasks by tag", error });
    }
}

// Mark task as complete
export async function completeTask(req, res) {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            { isCompleted: true },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        await logActivity({
            userId: req.user._id,
            action: "completed task",
            targetId: task._id,
        });

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Failed to complete task", error });
    }
}

// Mark task as incomplete
export async function uncompleteTask(req, res) {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            { isCompleted: false },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        await logActivity({
            userId: req.user._id,
            action: "uncompleted task",
            targetId: task._id,
        });

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: "Failed to uncomplete task", error });
    }
}

export async function getSubtasks(req, res) {
    try {
        const { parentId } = req.params;

        const subtasks = await Task.find({
            parentId: new mongoose.Types.ObjectId(parentId), // Ensure parentId is an ObjectId
            ownerId: req.user._id,
        }).sort({ order: 1, createdAt: -1 });

        res.status(200).json(subtasks);
    } catch (error) {
        res.status(500).json({ message: "Failed to get subtasks", error });
    }
}

export async function getSubtaskCompletionPercentage(req, res) {
    try {
        const { parentId } = req.params;

        const subtasks = await Task.find({
            parentId: new mongoose.Types.ObjectId(parentId), // Ensure parentId is an ObjectId
            ownerId: req.user._id,
        });

        if (subtasks.length === 0) {
            return res.status(200).json({ percentage: 0 });
        }

        const completed = subtasks.filter(t => t.isCompleted).length;
        const percentage = Math.round((completed / subtasks.length) * 100);

        res.status(200).json({ percentage });
    } catch (error) {
        res.status(500).json({ message: "Failed to calculate completion", error });
    }
}

export async function searchTasks(req, res) {
    try {
        const { query } = req.query; // Access the query parameter
        // Convert req.user._id to string to ensure consistent type for query
        const ownerId = req.user._id.toString(); // Renamed to ownerId for clarity

        if (!query) {
            // If the query is empty, return an empty array of tasks
            return res.status(200).json([]);
        }

        // Create a case-insensitive regex for searching
        const searchRegex = new RegExp(query, 'i');

        // --- DEBUGGING LOGS ---
        console.log('Search Query:', query);
        console.log('Search Regex:', searchRegex);
        console.log('Owner ID (as string):', ownerId); // Log as ownerId
        // --- END DEBUGGING LOGS ---

        const tasks = await Task.find({
            ownerId: ownerId, // Changed from userId to ownerId
            $or: [
                { content: { $regex: searchRegex } }, // Search in task content
                { tags: { $regex: searchRegex } }    // Correct way to search for regex in array elements
            ]
        }).sort({ createdAt: -1 }); // Sort by creation date, newest first

        // --- DEBUGGING LOGS ---
        console.log('Found Tasks:', tasks);
        // --- END DEBUGGING LOGS ---

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error searching tasks:', error);
        res.status(500).json({ message: "Failed to search tasks", error });
    }
}