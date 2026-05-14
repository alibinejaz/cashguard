import prisma from "../config/db.js";

export const getBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budgetLimit.findMany({
      where: { userId: req.user.id },
      orderBy: { category: "asc" },
    });

    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setBudgetLimit = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit } = req.body;

    if (!category || limit === undefined || Number(limit) < 0) {
      return res.status(400).json({ error: "Valid category and limit required" });
    }

    const budget = await prisma.budgetLimit.upsert({
      where: {
        userId_category: {
          userId: req.user.id,
          category,
        },
      },
      update: {
        limit: Number(limit),
      },
      create: {
        userId: req.user.id,
        category,
        limit: Number(limit),
      },
    });

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};