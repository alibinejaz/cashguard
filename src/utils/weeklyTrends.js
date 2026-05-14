export function getWeeklyTrends(expenses = []) {
  const today = new Date();

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
      const date = new Date(e.date);
      return date >= startOfLastWeek && date <= endOfLastWeek;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const difference = currentWeekSpent - lastWeekSpent;

  let trend = "stable";
  let message = "Your spending is stable compared to last week.";

  if (difference > 0) {
    trend = "increasing";
    message = `You spent Rs. ${difference.toLocaleString()} more than last week. Bad direction.`;
  }

  if (difference < 0) {
    trend = "decreasing";
    message = `You spent Rs. ${Math.abs(difference).toLocaleString()} less than last week. Good control.`;
  }

  return {
    currentWeekSpent,
    lastWeekSpent,
    difference,
    trend,
    message,
  };
}