import prisma from "../config/db.js";
import { getPlanComputedMetrics, getPlanStatus } from "../utils/planUtils.js";

const toNumber = (value) => Number(value || 0);
const ensurePlansModelReady = (res) => {
  if (prisma?.savingPlan) return true;
  res.status(503).json({
    error:
      "Plans feature is not ready yet. Run Prisma generate/migrate and restart backend.",
  });
  return false;
};

export const getPlans = async (req, res) => {
  try {
    if (!ensurePlansModelReady(res)) return;
    const plans = await prisma.savingPlan.findMany({
      where: { userId: req.user.id },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    });

    const computedPlans = plans.map((plan) => getPlanComputedMetrics(plan));
    res.json(computedPlans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    if (!ensurePlansModelReady(res)) return;
    const { name, targetAmount, savedAmount, deadline, description } = req.body;

    if (!name || !targetAmount || toNumber(targetAmount) <= 0 || !deadline) {
      return res.status(400).json({
        error: "Name, target amount, and deadline are required",
      });
    }

    const planData = {
      name: String(name).trim(),
      targetAmount: toNumber(targetAmount),
      savedAmount: Math.max(toNumber(savedAmount), 0),
      deadline: new Date(deadline),
      description: description ? String(description).trim() : null,
      status: "active",
      userId: req.user.id,
    };

    const status = getPlanStatus(planData);
    const created = await prisma.savingPlan.create({
      data: {
        ...planData,
        status,
      },
    });

    res.status(201).json(getPlanComputedMetrics(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    if (!ensurePlansModelReady(res)) return;
    const { id } = req.params;
    const { name, targetAmount, savedAmount, deadline, description, status } = req.body;

    const existing = await prisma.savingPlan.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) return res.status(404).json({ error: "Plan not found" });

    const nextData = {
      name: name !== undefined ? String(name).trim() : existing.name,
      targetAmount:
        targetAmount !== undefined ? toNumber(targetAmount) : Number(existing.targetAmount),
      savedAmount:
        savedAmount !== undefined ? Math.max(toNumber(savedAmount), 0) : Number(existing.savedAmount),
      deadline: deadline ? new Date(deadline) : existing.deadline,
      description:
        description !== undefined ? (description ? String(description).trim() : null) : existing.description,
      status: status || existing.status,
    };

    if (!nextData.name || nextData.targetAmount <= 0) {
      return res.status(400).json({ error: "Valid name and target amount are required" });
    }

    nextData.status = getPlanStatus(nextData);

    const updated = await prisma.savingPlan.update({
      where: { id },
      data: nextData,
    });

    res.json(getPlanComputedMetrics(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    if (!ensurePlansModelReady(res)) return;
    const { id } = req.params;

    const existing = await prisma.savingPlan.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Plan not found" });

    await prisma.savingPlan.delete({ where: { id } });
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addSavingToPlan = async (req, res) => {
  try {
    if (!ensurePlansModelReady(res)) return;
    const { id } = req.params;
    const { amount } = req.body;
    const delta = toNumber(amount);

    if (!delta || delta <= 0) {
      return res.status(400).json({ error: "Valid saving amount is required" });
    }

    const existing = await prisma.savingPlan.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) return res.status(404).json({ error: "Plan not found" });

    const nextSaved = Number(existing.savedAmount) + delta;
    const nextStatus = getPlanStatus({
      ...existing,
      savedAmount: nextSaved,
    });

    const updated = await prisma.savingPlan.update({
      where: { id },
      data: {
        savedAmount: nextSaved,
        status: nextStatus,
      },
    });

    res.json(getPlanComputedMetrics(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
