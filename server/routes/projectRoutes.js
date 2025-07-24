import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, favoriteProject, unfavoriteProject } from "../controllers/projectController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware); // Protect all routes below

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// NEW routes for favorite/unfavorite
router.patch("/:id/favorite", favoriteProject);
router.patch("/:id/unfavorite", unfavoriteProject);

export default router;
