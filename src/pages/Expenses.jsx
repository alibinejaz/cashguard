import { useEffect, useState } from "react";
import { Plus, Trash2, ReceiptText } from "lucide-react";

import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import ConfirmModal from "../components/ui/ConfirmModal";
import {
  useAddExpenseMutation,
  useDeleteExpenseMutation,
  useExpensesQuery,
} from "../hooks/useExpenses";

const categories = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Family",
  "Health",
  "Other",
];

export default function Expenses() {
  const token = useAuthStore((s) => s.token);
  const showToast = useToastStore((s) => s.showToast);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingExpense, setPendingExpense] = useState(null);
  const [warning, setWarning] = useState(null);
  const {
    data: expenses = [],
    isLoading: loading,
    isError,
    error,
  } = useExpensesQuery(token);
  const addExpenseMutation = useAddExpenseMutation(token);
  const deleteExpenseMutation = useDeleteExpenseMutation(token);
  const saving = addExpenseMutation.isPending;

  useEffect(() => {
    if (isError && error) {
      showToast(error.message || "Failed to load expenses", "error");
    }
  }, [isError, error, showToast]);

  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const resetForm = () => {
    setForm({
      amount: "",
      category: "Food",
      note: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const submitExpenseToApi = async (expenseData, confirm = false) => {
    try {
      const data = await addExpenseMutation.mutateAsync({
        ...expenseData,
        confirm,
      });

      if (data.warning) {
        setWarning(data.warning);
        setPendingExpense(expenseData);
        setShowConfirm(true);
        return;
      }

      if (data.warningUsed) {
        showToast("Expense added, but you ignored a warning.", "warning");
      } else {
        showToast("Expense added. You're still in control.", "success");
      }

      resetForm();
    } catch (err) {
      if (err?.status === 409 && err?.data?.warning) {
        setWarning(err.data.warning);
        setPendingExpense(expenseData);
        setShowConfirm(true);
        return;
      }
      showToast(err?.message || "Backend not reachable", "error");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }

    const expenseData = {
      amount: Number(form.amount),
      category: form.category,
      note: form.note || "-",
      date: form.date,
    };

    submitExpenseToApi(expenseData, false);
  };

  const handleConfirmExpense = async () => {
    if (!pendingExpense) return;

    setShowConfirm(false);
    setWarning(null);

    await submitExpenseToApi(pendingExpense, true);

    setPendingExpense(null);
  };

  const handleCancelExpense = () => {
    setShowConfirm(false);
    setWarning(null);
    setPendingExpense(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpenseMutation.mutateAsync(id);
      showToast("Expense deleted", "success");
    } catch (err) {
      showToast(err?.message || "Backend not reachable", "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-emerald-600">CashGuard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add every rupee you spend. Guessing is how budgets die.
          </p>
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <ReceiptText />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Expense</h2>
              <p className="text-sm text-slate-500">Log spending quickly.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Amount">
              <input
                type="number"
                placeholder="e.g. 1200"
                className="input"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />
            </Field>

            <Field label="Category">
              <select
                className="input"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </Field>

            <Field label="Note">
              <input
                type="text"
                placeholder="e.g. lunch, fuel, medicine"
                className="input"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>

            <button
              disabled={saving}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {saving ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Recent Expenses</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your latest spending records.
          </p>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-bold text-slate-400">
                Loading expenses...
              </div>
            ) : expenses.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                No expenses added yet
              </div>
            ) : (
              expenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      Rs. {Number(item.amount).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.category} • {item.note} •{" "}
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={showConfirm}
        title="Unsafe Spending"
        message={
          warning
            ? `${warning.reason}\n\n${warning.message}\n\nDo you still want to continue?`
            : ""
        }
        onCancel={handleCancelExpense}
        onConfirm={handleConfirmExpense}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
