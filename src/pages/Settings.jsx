import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useBudgetsQuery } from "../hooks/useBudgets";
import { useExpensesQuery } from "../hooks/useExpenses";
import {
  useResetFinanceMutation,
  useSettingsQuery,
  useUpdateSalaryMutation,
} from "../hooks/useSettings";

export default function Settings() {
  const token = useAuthStore((s) => s.token);
  const showToast = useToastStore((s) => s.showToast);

  const [salaryDraft, setSalaryDraft] = useState("");
  const [isSalaryDirty, setIsSalaryDirty] = useState(false);
  const {
    data: settingsData,
    isLoading: settingsLoading,
    isError,
    error,
  } = useSettingsQuery(token);
  const { data: expenses = [], isLoading: expensesLoading } = useExpensesQuery(token);
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery(token);
  const updateSalaryMutation = useUpdateSalaryMutation(token);
  const resetFinanceMutation = useResetFinanceMutation(token);
  const loading = settingsLoading || expensesLoading || budgetsLoading;
  const saving = updateSalaryMutation.isPending;
  const salary = isSalaryDirty
    ? salaryDraft
    : String(settingsData?.salary || "");
  const stats = {
    expensesCount: expenses.length,
    budgetCount: budgets.length,
  };

  useEffect(() => {
    if (isError && error) {
      showToast(error.message || "Failed to load settings", "error");
    }
  }, [isError, error, showToast]);

  const handleSaveSalary = async () => {
    if (!salary || Number(salary) < 0) {
      showToast("Enter valid salary", "error");
      return;
    }

    try {
      await updateSalaryMutation.mutateAsync(Number(salary));
      showToast("Salary updated", "success");
      setIsSalaryDirty(false);
      setSalaryDraft("");
    } catch (err) {
      showToast(err?.message || "Backend not reachable", "error");
    }
  };

  const handleReset = async () => {
    try {
      await resetFinanceMutation.mutateAsync();
      showToast("CashGuard data reset successfully.", "success");
      setIsSalaryDirty(false);
      setSalaryDraft("");
    } catch (err) {
      showToast(err?.message || "Backend not reachable", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold text-emerald-600">CashGuard</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your money system. Don’t reset unless you mean it.
        </p>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Salary Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your salary controls all budget calculations.
        </p>

        <input
          type="number"
          value={salary}
          onChange={(e) => {
            setIsSalaryDirty(true);
            setSalaryDraft(e.target.value);
          }}
          placeholder="Enter salary"
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />

        <button
          onClick={handleSaveSalary}
          disabled={saving}
          className="mt-4 w-full rounded-2xl bg-slate-950 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Salary"}
        </button>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        <StatusCard label="Expenses Logged" value={stats.expensesCount} />
        <StatusCard label="Budget Limits" value={stats.budgetCount} />
        <StatusCard label="Storage" value="Cloud (Backend)" />
      </section>

      <section className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        <p className="mt-2 text-sm leading-6 text-red-600">
          This will remove your salary, expenses, and budget limits from
          CashGuard. No undo.
        </p>

        <button
          onClick={handleReset}
          className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
        >
          Reset All Data
        </button>
      </section>
    </div>
  );
}

function StatusCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className="mt-3 text-2xl font-black text-slate-950">{value}</h2>
    </div>
  );
}
