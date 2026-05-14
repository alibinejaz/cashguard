import express from "express";
import { getWarnings } from "../controllers/warningController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWarnings);

export default router;