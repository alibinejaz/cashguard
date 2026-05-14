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
import PageHeader from "../components/common/PageHeader";
import SurfaceCard from "../components/common/SurfaceCard";
import MetricCard from "../components/common/MetricCard";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function Settings() {
  const token = useAuthStore((s) => s.token);
  const showToast = useToastStore((s) => s.showToast);

  const [salaryDraft, setSalaryDraft] = useState("");
  const [isSalaryDirty, setIsSalaryDirty] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your money system. Don’t reset unless you mean it."
      />

      <SurfaceCard className="mt-6">
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
          className="input mt-5 px-5 py-4 text-lg font-semibold"
        />

        <button
          onClick={handleSaveSalary}
          disabled={saving}
          className="mt-4 w-full rounded-2xl bg-slate-950 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Salary"}
        </button>
      </SurfaceCard>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        <MetricCard title="Expenses Logged" value={stats.expensesCount} />
        <MetricCard title="Budget Limits" value={stats.budgetCount} />
        <MetricCard title="Storage" value="Cloud (Backend)" />
      </section>

      <section className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        <p className="mt-2 text-sm leading-6 text-red-600">
          This will remove your salary, expenses, and budget limits from
          CashGuard. No undo.
        </p>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
        >
          Reset All Data
        </button>
      </section>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset All Data"
        subtitle="This action is permanent"
        message="This will remove your salary, expenses, budget limits, and warning history. This cannot be undone."
        tone="danger"
        confirmLabel="Yes, Reset Data"
        cancelLabel="Keep My Data"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={async () => {
          setShowResetConfirm(false);
          await handleReset();
        }}
      />
    </div>
  );
}
