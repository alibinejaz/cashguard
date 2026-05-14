import express from "express";
import { getBudgets, setBudgetLimit } from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getBudgets);
router.put("/:category", protect, setBudgetLimit);

export default router;