export function getSmartSuggestions({ salary, expenses, remaining, dailyBudget }) {
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
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const highestCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (highestCategory) {
    suggestions.push(
      `Your highest spending is on ${highestCategory[0]}: Rs. ${highestCategory[1].toLocaleString()}. Cut this first.`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("You are spending within control. Keep logging expenses daily.");
  }

  return suggestions;
}