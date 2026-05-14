export function getBudgetHealth({
  salary,
  totalSpent,
  remaining,
  dailyBudget,
}) {
  const today = new Date();
  const daysPassed = today.getDate();
  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  if (!salary || salary <= 0) {
    return {
      status: "empty",
      title: "Set your salary",
      message: "Add your monthly salary to unlock insights.",
      tone: "neutral",
    };
  }

  const projected = (totalSpent / daysPassed) * totalDays;

  if (projected > salary) {
    const overspend = Math.round(projected - salary);

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
      message: `You have overspent by Rs. ${Math.abs(
        remaining
      ).toLocaleString()}.`,
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
}