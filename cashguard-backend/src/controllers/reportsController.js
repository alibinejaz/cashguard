import prisma from "../config/db.js";

const monthRegex = /^\d{4}-\d{2}$/;
const yearRegex = /^\d{4}$/;

const getMonthRange = (monthParam) => {
  if (!monthParam) {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return {
      start,
      end,
      monthKey: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
    };
  }

  if (!monthRegex.test(monthParam)) return null;
  const [yearStr, monthStr] = monthParam.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (month < 1 || month > 12) return null;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end, monthKey: monthParam };
};

const getRangeFromQuery = ({ month, from, to, year }) => {
  if (from || to) {
    if (!from || !to || !monthRegex.test(from) || !monthRegex.test(to)) return null;
    const [fromYear, fromMonth] = from.split("-").map(Number);
    const [toYear, toMonth] = to.split("-").map(Number);
    const start = new Date(fromYear, fromMonth - 1, 1);
    const end = new Date(toYear, toMonth, 1);
    if (start >= end) return null;
    return { start, end, period: `${from} to ${to}` };
  }

  if (year) {
    if (!yearRegex.test(year)) return null;
    const y = Number(year);
    return {
      start: new Date(y, 0, 1),
      end: new Date(y + 1, 0, 1),
      period: year,
    };
  }

  const singleMonth = getMonthRange(month);
  if (!singleMonth) return null;
  return {
    ...singleMonth,
    period: singleMonth.monthKey,
  };
};

export const getReports = async (req, res) => {
  try {
    const monthRange = getRangeFromQuery(req.query);
    if (!monthRange) {
      return res.status(400).json({
        error: "Invalid period. Use month=YYYY-MM, from=YYYY-MM&to=YYYY-MM, or year=YYYY.",
      });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: monthRange.start,
          lt: monthRange.end,
        },
      },
      orderBy: { date: "desc" },
    });

    const profile = await prisma.financeProfile.findUnique({
      where: { userId: req.user.id },
    });

    const salary = Number(profile?.salary || 0);

    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining = salary - totalSpent;

    const diffMs = monthRange.end.getTime() - monthRange.start.getTime();
    const totalDays = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1);
    const remainingDays = totalDays;

    const dailyBudget =
      remainingDays > 0 ? Math.max(Math.floor(remaining / remainingDays), 0) : 0;

    const categoryMap = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
    });

    const categorySummary = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const biggestLeak = categorySummary[0] || null;

    const referenceDate =
      expenses.length > 0 ? new Date(expenses[0].date) : new Date(monthRange.start);
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());

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
      month: monthRange.monthKey || null,
      period: monthRange.period,
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
