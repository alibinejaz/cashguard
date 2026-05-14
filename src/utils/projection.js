export function getSpendingProjection({ totalSpent }) {
  const today = new Date();

  const daysPassed = today.getDate();
  const totalDays = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  if (daysPassed === 0) return null;

  const projected = Math.round((totalSpent / daysPassed) * totalDays);

  return {
    projected,
  };
}