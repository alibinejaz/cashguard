import express from "express";
import { getSettings, updateSalary, resetFinanceData } from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/salary", protect, updateSalary);
router.post("/reset", protect, resetFinanceData);

export default router;