import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addSavingToPlan,
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from "../controllers/planController.js";

const router = express.Router();

router.get("/", protect, getPlans);
router.post("/", protect, createPlan);
router.put("/:id", protect, updatePlan);
router.delete("/:id", protect, deletePlan);
router.post("/:id/add-saving", protect, addSavingToPlan);

export default router;
