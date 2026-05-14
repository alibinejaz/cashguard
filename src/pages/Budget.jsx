import { useEffect, useMemo, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useBudgetsQuery, useSetBudgetLimitMutation } from "../hooks/useBudgets";
import { useExpensesQuery } from "../hooks/useExpenses";
import PageHeader from "../components/common/PageHeader";
import SurfaceCard from "../components/common/SurfaceCard";

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
      <PageHeader
        title="Budget Plan"
        subtitle="Set category limits. Without limits, you are just watching yourself lose money."
      />

      <section className="mt-6 grid gap-5">
        {categories.map((category) => {
          const data = getCategoryData(category);

          return (
            <SurfaceCard key={category}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_200px] md:items-start">
                <div className="min-w-0">
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
                  className="input h-11 w-full md:justify-self-end"
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
            </SurfaceCard>
          );
        })}
      </section>
    </div>
  );
}
