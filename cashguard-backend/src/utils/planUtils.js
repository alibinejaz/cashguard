const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const startOfDay = (dateLike = new Date()) => {
  const d = new Date(dateLike);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (dateLike = new Date()) => {
  const d = new Date(dateLike);
  d.setHours(23, 59, 59, 999);
  return d;
};

const daysLeftUntil = (deadline, now = new Date()) => {
  const todayStart = startOfDay(now).getTime();
  const deadlineEnd = endOfDay(deadline).getTime();
  const diff = Math.ceil((deadlineEnd - todayStart) / MS_PER_DAY);
  return Math.max(diff, 1);
};

export const getPlanStatus = (plan) => {
  if ((plan.savedAmount || 0) >= (plan.targetAmount || 0)) return "completed";
  if (plan.status === "paused") return "paused";
  return "active";
};

export const getPlanComputedMetrics = (plan, now = new Date()) => {
  const targetAmount = Number(plan.targetAmount || 0);
  const savedAmount = Number(plan.savedAmount || 0);
  const remainingAmount = Math.max(targetAmount - savedAmount, 0);
  const progressPercentage =
    targetAmount > 0 ? Math.min(Math.round((savedAmount / targetAmount) * 100), 100) : 0;

  const status = getPlanStatus(plan);
  const daysLeft = daysLeftUntil(plan.deadline, now);
  const monthsLeft = Math.max(Math.ceil(daysLeft / 30), 1);

  const requiredDailySaving =
    status === "active" && remainingAmount > 0 ? Math.ceil(remainingAmount / daysLeft) : 0;
  const requiredMonthlySaving =
    status === "active" && remainingAmount > 0 ? Math.ceil(remainingAmount / monthsLeft) : 0;

  return {
    ...plan,
    targetAmount,
    savedAmount,
    remainingAmount,
    progressPercentage,
    requiredDailySaving,
    requiredMonthlySaving,
    status,
  };
};

export const getActivePlanPressure = (plans, now = new Date()) => {
  return plans.reduce((sum, plan) => {
    const computed = getPlanComputedMetrics(plan, now);
    return sum + Number(computed.requiredDailySaving || 0);
  }, 0);
};
