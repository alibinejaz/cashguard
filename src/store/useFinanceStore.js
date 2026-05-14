import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      salary: 0,
      expenses: [],
      budgetLimits: {},
      ignoredWarnings: 0,
      streak: 0,
      lastCheckedDate: null,

      setSalary: (amount) => set({ salary: Number(amount) }),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, expense],
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),

      setBudgetLimit: (category, amount) =>
        set((state) => ({
          budgetLimits: {
            ...state.budgetLimits,
            [category]: Number(amount),
          },
        })),

      getTotalSpent: () => {
        return get().expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      },

      getRemaining: () => {
        return get().salary - get().getTotalSpent();
      },

      getRemainingDays: () => {
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return Math.max(lastDay.getDate() - today.getDate(), 1);
      },

      getSafeDailyBudget: () => {
        const remaining = get().getRemaining();
        const days = get().getRemainingDays();
        return Math.floor(remaining / days);
      },

      getCategorySpent: (category) => {
        return get()
          .expenses.filter((expense) => expense.category === category)
          .reduce((sum, expense) => sum + Number(expense.amount), 0);
      },

      getCategoryLimitStatus: (category) => {
        const limit = get().budgetLimits[category] || 0;
        const spent = get().getCategorySpent(category);
        const remaining = limit - spent;

        const percentage =
          limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

        if (limit <= 0) {
          return {
            status: "empty",
            limit,
            spent,
            remaining,
            percentage,
            message: "No limit set",
          };
        }

        if (spent >= limit) {
          return {
            status: "danger",
            limit,
            spent,
            remaining,
            percentage,
            message: `Limit crossed by Rs. ${Math.abs(
              remaining
            ).toLocaleString()}`,
          };
        }

        if (spent >= limit * 0.75) {
          return {
            status: "warning",
            limit,
            spent,
            remaining,
            percentage,
            message: `Only Rs. ${remaining.toLocaleString()} left`,
          };
        }

        return {
          status: "safe",
          limit,
          spent,
          remaining,
          percentage,
          message: `Remaining Rs. ${remaining.toLocaleString()}`,
        };
      },
      resetFinanceData: () =>
        set({
          salary: 0,
          expenses: [],
          budgetLimits: {},
          ignoredWarnings: 0,
          streak: 0,
          lastCheckedDate: null,
        }),
      incrementIgnoredWarnings: () =>
        set((state) => ({
          ignoredWarnings: state.ignoredWarnings + 1,
        })),
      updateStreak: () => {
        const today = new Date().toDateString();

        const state = get();

        if (state.lastCheckedDate === today) return;

        const dailyBudget = state.getSafeDailyBudget();
        const todaySpent = state.expenses
          .filter(
            (e) => new Date(e.date).toDateString() === today
          )
          .reduce((sum, e) => sum + Number(e.amount), 0);

        const newStreak =
          todaySpent <= dailyBudget ? state.streak + 1 : 0;

        set({
          streak: newStreak,
          lastCheckedDate: today,
        });
      },
    }),
    {
      name: "cashguard-storage",
    }
  )
);