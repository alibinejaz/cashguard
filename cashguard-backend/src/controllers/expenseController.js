import prisma from "../config/db.js";

export const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const { amount, category, note, date, confirm } = req.body;

    if (!amount || Number(amount) <= 0 || !category) {
      return res.status(400).json({ error: "Valid amount and category are required" });
    }

    const profile = await prisma.financeProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile || profile.salary <= 0) {
      return res.status(400).json({
        error: "Set your salary before adding expenses",
      });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
    });

    const budgetLimit = await prisma.budgetLimit.findUnique({
      where: {
        userId_category: {
          userId: req.user.id,
          category,
        },
      },
    });

    const currentCategorySpent = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const willCrossCategoryLimit =
      budgetLimit && currentCategorySpent + Number(amount) > budgetLimit.limit;

    const totalSpentAfter =
      expenses.reduce((sum, e) => sum + Number(e.amount), 0) + Number(amount);

    const today = new Date();
    const daysPassed = today.getDate();
    const totalDays = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    const projected = Math.round((totalSpentAfter / daysPassed) * totalDays);
    const overspend = projected - profile.salary;

    const remainingDays = totalDays - daysPassed + 1;
    const remainingBefore =
      profile.salary - expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const safeDailyBudgetBefore =
      remainingDays > 0
        ? Math.max(Math.floor(remainingBefore / remainingDays), 0)
        : 0;

    const todaySpentBefore = expenses
      .filter((e) => new Date(e.date).toDateString() === today.toDateString())
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const todaySpentAfter = todaySpentBefore + Number(amount);
    const willCrossDailyBudget = todaySpentAfter > safeDailyBudgetBefore;

    let warning = null;
    const reasonParts = [];
    const messageParts = [];

    if (willCrossCategoryLimit) {
      reasonParts.push(`${category} limit will be crossed`);
      messageParts.push(
        `${category} budget limit is Rs. ${budgetLimit.limit.toLocaleString()}. This expense crosses it.`
      );
    }

    if (willCrossDailyBudget) {
      reasonParts.push("Daily safe budget will be crossed");
      messageParts.push(
        `Today's spending becomes Rs. ${todaySpentAfter.toLocaleString()} while your current safe daily budget is Rs. ${safeDailyBudgetBefore.toLocaleString()}.`
      );
    }

    if (reasonParts.length > 0) {
      warning = {
        type: reasonParts.length > 1 ? "category_daily_budget" : willCrossCategoryLimit ? "category" : "daily_budget",
        reason: `${reasonParts.join(" + ")}.`,
        message: messageParts.join(" "),
      };
    }

    // Keep existing severe projection warning when category/daily checks do not trigger.
    if (!warning && overspend > 0 && Number(amount) > profile.salary * 0.3) {
      warning = {
        type: "projection",
        reason: "This expense puts your monthly projection over salary.",
        projected,
        overspend,
        message: `At this rate, you will overspend by Rs. ${overspend.toLocaleString()} this month.`,
      };
    }

    if (warning && !confirm) {
      return res.status(409).json({ warning });
    }

    if (warning && confirm) {
      await prisma.financeProfile.update({
        where: { userId: req.user.id },
        data: {
          ignoredWarnings: {
            increment: 1,
          },
        },
      });

      await prisma.warningLog.create({
        data: {
          userId: req.user.id,
          type: warning.type,
          reason: warning.reason,
          message: warning.message,
          amount: Number(amount),
          category,
        },
      });
    }

    const expense = await prisma.expense.create({
      data: {
        userId: req.user.id,
        amount: Number(amount),
        category,
        note: note || "-",
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json({
      expense,
      warningUsed: Boolean(warning && confirm),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
