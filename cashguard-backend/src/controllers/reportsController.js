import prisma from "../config/db.js";

export const getReports = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });

    const profile = await prisma.financeProfile.findUnique({
      where: { userId: req.user.id },
    });

    const salary = Number(profile?.salary || 0);

    // 🔹 Total calculations
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining = salary - totalSpent;

    // 🔹 Daily budget
    const today = new Date();
    const daysPassed = today.getDate();
    const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = totalDays - daysPassed + 1;

    const dailyBudget =
      remainingDays > 0 ? Math.max(Math.floor(remaining / remainingDays), 0) : 0;

    // 🔹 Category Insights
    const categoryMap = {};

    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
    });

    const categorySummary = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const biggestLeak = categorySummary[0] || null;

    // 🔹 Weekly Trends
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(startOfWeek.getDate() - 1);

    const currentWeekSpent = expenses
      .filter((e) => new Date(e.date) >= startOfWeek)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const lastWeekSpent = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= startOfLastWeek && d <= endOfLastWeek;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const difference = currentWeekSpent - lastWeekSpent;

let trend = "stable";
let trendMessage = "Your spending is stable compared to last week.";

if (currentWeekSpent === 0 && lastWeekSpent === 0) {
  trend = "none";
  trendMessage = "No spending data yet. Start adding expenses.";
} else if (difference > 0) {
  trend = "increasing";
  trendMessage = `You spent Rs. ${difference.toLocaleString()} more than last week. Bad direction.`;
} else if (difference < 0) {
  trend = "decreasing";
  trendMessage = `You spent Rs. ${Math.abs(difference).toLocaleString()} less than last week. Good control.`;
}

    res.json({
      salary,
      totalSpent,
      remaining,
      dailyBudget,
      biggestLeak,
      categorySummary,
      weeklyTrends: {
        currentWeekSpent,
        lastWeekSpent,
        difference,
        trend,
        message: trendMessage,
      },
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};