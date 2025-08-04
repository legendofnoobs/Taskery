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

// Define a mapping for priority strings to numbers
const priorityMap = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'urgent': 4
};

// Helper function to convert priority string or number to a numerical priority
function getPriorityNumber(priorityInput) {
    // If the input is already a number, and it's one of our valid priority numbers, return it directly.
    if (typeof priorityInput === 'number' && [1, 2, 3, 4].includes(priorityInput)) {
        return priorityInput;
    }
    // If the input is a string, convert it to lowercase and check the map.
    if (typeof priorityInput === 'string') {
        const numericalValue = priorityMap[priorityInput.toLowerCase()];
        // Return the numerical value if found, otherwise return null.
        return numericalValue !== undefined ? numericalValue : null; 
    }
    // For any other type (null, undefined, or invalid non-string/non-number), return null.
    return null; 
}

// Create a new task
export async function createTask(req, res) {
    try {
        const {
            content,
            description,
            projectId,
            priority, // This will be a string from the frontend
            dueDate,
            tags = [],
            order,
            parentId,
        } = req.body;

        // Basic validation: Ensure required fields are present
        if (!content || !projectId) {
            return res.status(400).json({ message: "Content and Project ID are required." });
        }

        // Ensure req.user._id is available (set by authMiddleware)
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated or user ID missing." });
        }

        // Convert priority string to number before saving
        const numericalPriority = getPriorityNumber(priority);

        const task = await Task.create({
            content,
            description,
            projectId,
            ownerId: req.user._id,
            priority: numericalPriority, // Use the numerical value (will be null if not matched)
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
        console.error('Error creating task:', error); // Log the full error for debugging
        // Provide a more descriptive error message
        res.status(500).json({ message: "Failed to create task", error: error.message });
    }
}

// Get all tasks for a project, with optional parentId, dueDate, and priority filtering
export async function getTasksByProject(req, res) {
    try {
        const { projectId } = req.params;
        const { parentId, dueDate: filterDueDate, priority: filterPriority } = req.query; // Get filter parameters

        let query = {
            projectId: new mongoose.Types.ObjectId(projectId), // Ensure projectId is an ObjectId
            ownerId: req.user._id,
        };

        // Filter by parentId
        if (parentId === 'null' || parentId === undefined) {
            query.parentId = null; // Filter for top-level tasks
        } else if (parentId) {
            query.parentId = new mongoose.Types.ObjectId(parentId); // Filter by specific parentId
        }

        // --- Date Filtering Logic ---
        if (filterDueDate && filterDueDate !== 'all') {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0); // Start of today in UTC

            const tomorrow = new Date(today);
            tomorrow.setUTCDate(today.getUTCDate() + 1); // Start of tomorrow in UTC

            const endOfTomorrow = new Date(tomorrow);
            endOfTomorrow.setUTCHours(23, 59, 59, 999); // End of tomorrow in UTC

            const startOfWeek = new Date(today);
            startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay()); // Start of current week (Sunday) in UTC
            startOfWeek.setUTCHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // End of current week (Saturday) in UTC
            endOfWeek.setUTCHours(23, 59, 59, 999);

            switch (filterDueDate) {
                case 'today':
                    query.dueDate = { $gte: today, $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }; // End of today
                    break;
                case 'tomorrow':
                    query.dueDate = { $gte: tomorrow, $lte: endOfTomorrow };
                    break;
                case 'this_week':
                    query.dueDate = { $gte: startOfWeek, $lte: endOfWeek };
                    break;
                case 'overdue':
                    query.dueDate = { $lt: today };
                    query.isCompleted = false; // Only overdue if not completed
                    break;
                // 'all' case is handled by not adding dueDate to query
            }
        }

        // --- Priority Filtering Logic ---
        if (filterPriority && filterPriority !== 'all') {
            const numericalFilterPriority = getPriorityNumber(filterPriority);
            // Only add to query if it's a valid numerical priority (not null)
            if (numericalFilterPriority !== null) { 
                query.priority = numericalFilterPriority;
            } else {
                // If filterPriority is an unrecognized string and getPriorityNumber returns null,
                // we don't add priority to the query, effectively treating it as 'all' for unknown values.
            }
        }

        let tasks = await Task.find(query).sort({ order: 1, createdAt: -1 }).lean();

        if (parentId === 'null' || parentId === undefined) {
            tasks = await Promise.all(tasks.map(async (task) => {
                const subtaskCount = await Task.countDocuments({
                    parentId: task._id,
                    ownerId: req.user._id
                });
                return { ...task, subtaskCount };
            }));
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Failed to get tasks for project:', error);
        res.status(500).json({ message: "Failed to get tasks", error: error.message });
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
        const { priority, ...otherUpdates } = req.body; // Destructure priority

        const updates = { ...otherUpdates };

        // Convert priority string to number if it's being updated.
        // If 'priority' is explicitly provided in the request body (even as null or an empty string),
        // we process it to set the database field to null if it's not a recognized priority string.
        // If 'priority' is undefined (meaning it wasn't sent in the request body),
        // we don't include it in the updates, leaving the database field unchanged.
        if (priority !== undefined) { 
            updates.priority = getPriorityNumber(priority); // Use the helper function
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            updates, // Use the updates object
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
export async function searchTasks(req, res) { // Renamed from searchByTag to searchTasks based on router.get('/search')
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

        const tasks = await Task.find({
            ownerId: ownerId, // Changed from userId to ownerId
            $or: [
                { content: { $regex: searchRegex } }, // Search in task content
                { tags: { $regex: searchRegex } }    // Correct way to search for regex in array elements
            ]
        }).sort({ createdAt: -1 }); // Sort by creation date, newest first

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error searching tasks:', error);
        res.status(500).json({ message: "Failed to search tasks", error });
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
