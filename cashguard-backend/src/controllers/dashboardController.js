import prisma from "../config/db.js";
import { getActivePlanPressure } from "../utils/planUtils.js";

const getActivePlansSafely = async (userId) => {
  if (!prisma?.savingPlan?.findMany) return [];
  try {
    return await prisma.savingPlan.findMany({
      where: {
        userId,
        status: "active",
      },
    });
  } catch (err) {
    // If migration is not applied yet, avoid breaking dashboard.
    if (err?.code === "P2021") return [];
    throw err;
  }
};

const getMonthRange = (baseDate = new Date()) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
  return { start, end };
};

const getBehaviorMessage = (count) => {
  if (count === 0) {
    return {
      tone: "safe",
      message: "You are making disciplined financial decisions.",
    };
  }

  if (count <= 2) {
    return {
      tone: "warning",
      message: `You ignored ${count} warning${count > 1 ? "s" : ""}. Be careful.`,
    };
  }

  if (count <= 5) {
    return {
      tone: "danger",
      message: `You ignored ${count} warnings. Your spending is getting out of control.`,
    };
  }

  return {
    tone: "danger",
    message: `You ignored ${count} warnings. You have lost control of your budget.`,
  };
};

const getBudgetHealth = ({ salary, totalSpent, remaining, dailyBudget }) => {
  const today = new Date();
  const daysPassed = today.getDate();
  const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (!salary || salary <= 0) {
    return {
      status: "empty",
      title: "Set your salary",
      message: "Add your monthly salary to unlock insights.",
      tone: "neutral",
    };
  }

  const projected = Math.round((totalSpent / daysPassed) * totalDays);

  if (projected > salary) {
    const overspend = projected - salary;

    return {
      status: "danger",
      title: "You are on a dangerous path",
      message: `At this pace, you will overspend by Rs. ${overspend.toLocaleString()}. Slow down now.`,
      tone: "red",
    };
  }

  if (remaining < 0) {
    return {
      status: "danger",
      title: "You are over budget",
      message: `You have overspent by Rs. ${Math.abs(remaining).toLocaleString()}.`,
      tone: "red",
    };
  }

  if (dailyBudget < 1000) {
    return {
      status: "warning",
      title: "Survival mode needed",
      message: `Only Rs. ${dailyBudget.toLocaleString()} left per day.`,
      tone: "orange",
    };
  }

  return {
    status: "safe",
    title: "You are in control",
    message: `You can safely spend around Rs. ${dailyBudget.toLocaleString()} per day.`,
    tone: "emerald",
  };
};

const getSmartSuggestions = ({ salary, expenses, remaining, dailyBudget }) => {
  if (!salary || salary <= 0) {
    return ["Set your monthly salary first to unlock smart suggestions."];
  }

  if (expenses.length === 0) {
    return ["Add your first expense so CashGuard can understand your spending pattern."];
  }

  const suggestions = [];

  if (remaining < 0) {
    suggestions.push("You are already over budget. Stop all non-essential spending.");
  }

  if (dailyBudget < 1000) {
    suggestions.push("Survival Mode: avoid food delivery, shopping, and unnecessary transport.");
  }

  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  if (highestCategory) {
    suggestions.push(
      `Your highest spending is on ${highestCategory[0]}: Rs. ${highestCategory[1].toLocaleString()}. Cut this first.`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("You are spending within control. Keep logging expenses daily.");
  }

  return suggestions;
};

export const getDashboard = async (req, res) => {
  try {
    const profile = await prisma.financeProfile.findUnique({
      where: { userId: req.user.id },
    });

    const today = new Date();
    const { start, end } = getMonthRange(today);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: start,
          lt: end,
        },
      },
    });
    const plans = await getActivePlansSafely(req.user.id);

    const salary = Number(profile?.salary || 0);
    const ignoredWarnings = Number(profile?.ignoredWarnings || 0);
    const streak = Number(profile?.streak || 0);

    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining = salary - totalSpent;

    const daysPassed = today.getDate();
    const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = totalDays - daysPassed + 1;

    const normalDailyBudget =
      remainingDays > 0 ? Math.max(Math.floor(remaining / remainingDays), 0) : 0;
    const planPressure = getActivePlanPressure(plans, today);
    const dailyBudget = Math.max(normalDailyBudget - planPressure, 0);

    const projected =
      daysPassed > 0 ? Math.round((totalSpent / daysPassed) * totalDays) : 0;

    const projectedOverspend = projected - salary;

    const spentPercentage =
      salary > 0 ? Math.min(Math.round((totalSpent / salary) * 100), 100) : 0;

    const health = getBudgetHealth({
      salary,
      totalSpent,
      remaining,
      dailyBudget,
    });

    const behavior = getBehaviorMessage(ignoredWarnings);

    const suggestions = getSmartSuggestions({
      salary,
      expenses,
      remaining,
      dailyBudget,
    });

    const dailyBudgetMessage =
      planPressure > 0
        ? `You can safely spend Rs. ${dailyBudget.toLocaleString()} today after protecting Rs. ${planPressure.toLocaleString()} for your active plans.`
        : `You can safely spend around Rs. ${dailyBudget.toLocaleString()} per day.`;

    res.json({
      salary,
      totalSpent,
      remaining,
      normalDailyBudget,
      planPressure,
      dailyBudget,
      dailyBudgetMessage,
      projected,
      projectedOverspend,
      spentPercentage,
      health,
      ignoredWarnings,
      behavior,
      streak,
      suggestions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
