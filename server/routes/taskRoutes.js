import { Router } from "express";
import { createTask, getTasksByProject, getTaskById, updateTask, deleteTask, completeTask, uncompleteTask, getSubtasks, getSubtaskCompletionPercentage, searchTasks  } from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware); // All routes below require auth

router.post("/", createTask);
router.get("/project/:projectId", getTasksByProject);
// router.get("/tag/search", searchByTag); // ?tag=work
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.patch("/:id/complete", completeTask);
router.patch("/:id/uncomplete", uncompleteTask);

router.get("/subtasks/:parentId", getSubtasks);

router.get("/completion/:parentId", getSubtaskCompletionPercentage);

// IMPORTANT: Define the more specific 'search' route FIRST
router.get('/search', searchTasks); // This should come before /:id

router.get("/:id", getTaskById);

export default router;