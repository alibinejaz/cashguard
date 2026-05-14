import { useMemo, useState } from "react";
import { PiggyBank, Pencil, Plus, Trash2 } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import PageHeader from "../components/common/PageHeader";
import SurfaceCard from "../components/common/SurfaceCard";
import FormField from "../components/common/FormField";
import EmptyState from "../components/common/EmptyState";
import {
  useAddSavingMutation,
  useCreatePlanMutation,
  useDeletePlanMutation,
  usePlansQuery,
  useUpdatePlanMutation,
} from "../hooks/usePlans";

const getToday = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  name: "",
  targetAmount: "",
  savedAmount: "",
  deadline: "",
  description: "",
};

export default function Plans() {
  const token = useAuthStore((s) => s.token);
  const showToast = useToastStore((s) => s.showToast);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [savingDrafts, setSavingDrafts] = useState({});

  const { data: plans = [], isLoading } = usePlansQuery(token);
  const createPlan = useCreatePlanMutation(token);
  const updatePlan = useUpdatePlanMutation(token);
  const deletePlan = useDeletePlanMutation(token);
  const addSaving = useAddSavingMutation(token);

  const activePlanPressure = useMemo(
    () =>
      plans
        .filter((plan) => plan.status === "active")
        .reduce((sum, plan) => sum + Number(plan.requiredDailySaving || 0), 0),
    [plans]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || Number(form.targetAmount) <= 0 || !form.deadline) {
      showToast("Plan name, target, and deadline are required", "error");
      return;
    }

    const payload = {
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      savedAmount: Number(form.savedAmount || 0),
      deadline: form.deadline,
      description: form.description.trim() || null,
    };

    try {
      if (editId) {
        await updatePlan.mutateAsync({ id: editId, ...payload });
        showToast("Plan updated", "success");
      } else {
        await createPlan.mutateAsync(payload);
        showToast("Plan created", "success");
      }
      setForm(initialForm);
      setEditId(null);
    } catch (error) {
      showToast(error?.message || "Failed to save plan", "error");
    }
  };

  const startEdit = (plan) => {
    setEditId(plan.id);
    setForm({
      name: plan.name || "",
      targetAmount: String(plan.targetAmount || ""),
      savedAmount: String(plan.savedAmount || ""),
      deadline: new Date(plan.deadline).toISOString().slice(0, 10),
      description: plan.description || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      await deletePlan.mutateAsync(id);
      showToast("Plan deleted", "success");
      if (editId === id) {
        setEditId(null);
        setForm(initialForm);
      }
    } catch (error) {
      showToast(error?.message || "Failed to delete plan", "error");
    }
  };

  const handleAddSaving = async (id) => {
    const amount = Number(savingDrafts[id] || 0);
    if (amount <= 0) {
      showToast("Enter valid saving amount", "error");
      return;
    }

    try {
      await addSaving.mutateAsync({ id, amount });
      showToast("Saving added to plan", "success");
      setSavingDrafts((prev) => ({ ...prev, [id]: "" }));
    } catch (error) {
      showToast(error?.message || "Failed to add saving", "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Plans"
        subtitle="Your future goals must control your spending decisions today."
      />

      <section className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        <SurfaceCard>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <PiggyBank />
            </div>
            <div>
              <h2 className="text-lg font-bold">{editId ? "Edit Plan" : "Create Plan"}</h2>
              <p className="text-sm text-slate-500">Protect future goals before spending.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Plan Name">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Dubai Trip 2027"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Target Amount">
                <input
                  type="number"
                  className="input"
                  value={form.targetAmount}
                  onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))}
                  placeholder="800000"
                />
              </FormField>
              <FormField label="Already Saved">
                <input
                  type="number"
                  className="input"
                  value={form.savedAmount}
                  onChange={(e) => setForm((p) => ({ ...p, savedAmount: e.target.value }))}
                  placeholder="50000"
                />
              </FormField>
            </div>

            <FormField label="Deadline">
              <input
                type="date"
                min={getToday()}
                className="input"
                value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
              />
            </FormField>

            <FormField label="Description (Optional)">
              <textarea
                className="input min-h-24 resize-y"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional details"
              />
            </FormField>

            <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
              <Plus size={18} />
              {editId ? "Update Plan" : "Create Plan"}
            </button>
          </form>
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard>
            <h2 className="text-lg font-bold">Plan Pressure</h2>
            <p className="mt-2 text-sm text-slate-600">
              You need to protect{" "}
              <span className="font-bold text-slate-900">
                Rs. {activePlanPressure.toLocaleString()}
              </span>{" "}
              per day for active plans.
            </p>
          </SurfaceCard>

          <SurfaceCard>
            <h2 className="text-lg font-bold">Active Plans</h2>
            <p className="mt-1 text-sm text-slate-500">
              Plans directly reduce your safe daily spend in Dashboard.
            </p>

            <div className="mt-5 space-y-3">
              {isLoading ? (
                <EmptyState text="Loading plans..." />
              ) : plans.length === 0 ? (
                <EmptyState text="No plans yet. Create your first future goal." />
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900">{plan.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Deadline: {new Date(plan.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(plan)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-200"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p>Target: Rs. {Number(plan.targetAmount).toLocaleString()}</p>
                      <p>Saved: Rs. {Number(plan.savedAmount).toLocaleString()}</p>
                      <p>Remaining: Rs. {Number(plan.remainingAmount).toLocaleString()}</p>
                      <p>Progress: {Number(plan.progressPercentage)}%</p>
                      <p>Daily Need: Rs. {Number(plan.requiredDailySaving).toLocaleString()}</p>
                      <p>Monthly Need: Rs. {Number(plan.requiredMonthlySaving).toLocaleString()}</p>
                    </div>

                    {plan.description ? (
                      <p className="mt-3 text-sm text-slate-500">{plan.description}</p>
                    ) : null}

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(Number(plan.progressPercentage || 0), 100)}%` }}
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="number"
                        value={savingDrafts[plan.id] || ""}
                        onChange={(e) =>
                          setSavingDrafts((prev) => ({ ...prev, [plan.id]: e.target.value }))
                        }
                        className="input sm:max-w-[180px]"
                        placeholder="Add saving"
                      />
                      <button
                        onClick={() => handleAddSaving(plan.id)}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Add Saving
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}
