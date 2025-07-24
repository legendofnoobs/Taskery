import { Router } from "express";
import { createLog, getMyLogs, getLogsByEntity, deleteAllMyLogs } from "../controllers/activityLogController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware); // All routes below require auth

// router.post("/", createLog); // optional, if manual
router.get("/", getMyLogs);
router.get("/entity/:entityId", getLogsByEntity);
router.delete("/delete-logs", deleteAllMyLogs);

export default router;
