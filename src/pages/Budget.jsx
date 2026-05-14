import { useEffect, useMemo, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useBudgetsQuery, useSetBudgetLimitMutation } from "../hooks/useBudgets";
import { useExpensesQuery } from "../hooks/useExpenses";

const categories = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Family",
  "Health",
  "Other",
];

export default function Budget() {
  const token = useAuthStore((s) => s.token);
  const showToast = useToastStore((s) => s.showToast);

  const [budgetDrafts, setBudgetDrafts] = useState({});
  const {
    data: budgetsData = [],
    isLoading: budgetsLoading,
    isError: budgetsError,
    error: budgetsQueryError,
  } = useBudgetsQuery(token);
  const {
    data: expenses = [],
    isLoading: expensesLoading,
    isError: expensesError,
    error: expensesQueryError,
  } = useExpensesQuery(token);
  const setBudgetMutation = useSetBudgetLimitMutation(token);
  const loading = budgetsLoading || expensesLoading;
  const budgetMap = useMemo(() => {
    const map = {};
    budgetsData.forEach((b) => {
      map[b.category] = b.limit;
    });
    return map;
  }, [budgetsData]);

  useEffect(() => {
    if (budgetsError || expensesError) {
      showToast(
        budgetsQueryError?.message ||
          expensesQueryError?.message ||
          "Failed to load budget data",
        "error"
      );
    }
  }, [
    budgetsError,
    expensesError,
    budgetsQueryError,
    expensesQueryError,
    showToast,
  ]);

  const handleLimitChange = async (category, value) => {
    const limit = Number(value);

    setBudgetDrafts((prev) => ({
      ...prev,
      [category]: value,
    }));

    try {
      await setBudgetMutation.mutateAsync({ category, limit });
      setBudgetDrafts((prev) => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
      showToast(`${category} limit updated`, "success");
    } catch (error) {
      showToast(error?.message || "Backend not reachable", "error");
    }
  };

  const getCategoryData = (category) => {
    const spent = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const limit = Number(
      budgetDrafts[category] !== undefined
        ? budgetDrafts[category]
        : budgetMap[category] || 0
    );

    let percentage = 0;
    if (limit > 0) {
      percentage = Math.min(Math.round((spent / limit) * 100), 100);
    }

    let status = "safe";
    let message = "Within budget";

    if (limit === 0) {
      message = "No limit set";
    } else if (percentage >= 100) {
      status = "danger";
      message = "Budget exceeded";
    } else if (percentage >= 75) {
      status = "warning";
      message = "Close to limit";
    }

    return { spent, limit, percentage, status, message };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading budgets...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-emerald-600">CashGuard</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Budget Plan
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Set category limits. Without limits, you are just watching yourself lose money.
        </p>
      </div>

      <section className="mt-6 grid gap-5">
        {categories.map((category) => {
          const data = getCategoryData(category);

          return (
            <div
              key={category}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold">{category}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Spent Rs. {data.spent.toLocaleString()}
                    {data.limit > 0 &&
                      ` of Rs. ${data.limit.toLocaleString()}`}
                  </p>
                </div>

                <input
                  type="number"
                  placeholder="Set limit"
                  value={
                    budgetDrafts[category] !== undefined
                      ? budgetDrafts[category]
                      : budgetMap[category] || ""
                  }
                  onChange={(e) =>
                    handleLimitChange(category, e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 md:w-48"
                />
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    data.status === "danger"
                      ? "bg-red-500"
                      : data.status === "warning"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${data.percentage}%` }}
                />
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span
                  className={
                    data.status === "danger"
                      ? "font-semibold text-red-600"
                      : data.status === "warning"
                      ? "font-semibold text-orange-600"
                      : "text-slate-500"
                  }
                >
                  {data.message}
                </span>

                <span className="font-semibold text-slate-900">
                  {data.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
