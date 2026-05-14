export function getCategoryInsights(expenses = []) {
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (!expenses.length || totalSpent <= 0) {
    return {
      totalSpent: 0,
      categories: [],
      highestCategory: null,
      insight: "Add expenses to see which category is eating your money.",
    };
  }

  const categoryMap = expenses.reduce((acc, expense) => {
    const category = expense.category || "Other";
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {});

  const categories = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalSpent) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestCategory = categories[0];

  return {
    totalSpent,
    categories,
    highestCategory,
    insight: `${highestCategory.category} is your biggest spending category at ${highestCategory.percentage}%. Control this first.`,
  };
}