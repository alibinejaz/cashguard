import {
  Wallet,
  TrendingDown,
  PiggyBank,
  CalendarDays,
  Plus,
  Target,
  ShieldCheck,
  AlertTriangle,
  Trophy,
  Brain,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SurfaceCard from "../components/common/SurfaceCard";
import DashboardStatCard from "../components/dashboard/DashboardStatCard";
import DashboardInsightCard from "../components/dashboard/DashboardInsightCard";
import SuggestionChip from "../components/dashboard/SuggestionChip";

import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useDashboardQuery } from "../hooks/useDashboard";
import { useMeQuery } from "../hooks/useAuthApi";
import { useWarningsQuery } from "../hooks/useWarnings";
import { useUpdateSalaryMutation } from "../hooks/useSettings";

export default function Dashboard() {
  const token = useAuthStore((s) => s.token);
  const showToast = useToastStore((s) => s.showToast);
  const [salaryDraft, setSalaryDraft] = useState("");
  const [isSalaryDirty, setIsSalaryDirty] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const {
    data,
    isLoading: dashboardLoading,
    isError: dashboardError,
    error: dashboardQueryError,
  } = useDashboardQuery(token);
  const { data: meData } = useMeQuery(token);
  const {
    data: warnings = [],
    refetch: refetchWarnings,
  } = useWarningsQuery(token, false);
  const salaryMutation = useUpdateSalaryMutation(token);
  const savingSalary = salaryMutation.isPending;
  const loading = dashboardLoading;
  const user = meData?.user || null;
  const salaryInput = isSalaryDirty ? salaryDraft : String(data?.salary || "");

  useEffect(() => {
    if (dashboardError && dashboardQueryError) {
      showToast(dashboardQueryError.message || "Failed to load dashboard", "error");
    }
  }, [dashboardError, dashboardQueryError, showToast]);

  const fetchWarnings = async () => {
    try {
      const result = await refetchWarnings();
      if (result.error) {
        showToast(result.error.message || "Failed to load warnings", "error");
        return;
      }
      setShowWarnings(true);
    } catch (error) {
      showToast(error.message || "Failed to load warnings", "error");
    }
  };

  const handleSalarySave = async () => {
    if (!salaryInput || Number(salaryInput) < 0) {
      showToast("Enter a valid salary", "error");
      return;
    }

    try {
      await salaryMutation.mutateAsync(Number(salaryInput));
      showToast("Salary updated", "success");
      setIsSalaryDirty(false);
      setSalaryDraft("");
    } catch (err) {
      showToast(err?.message || "Backend not reachable", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 px-6 py-4 text-sm font-bold text-slate-500 shadow-sm">
          Loading CashGuard...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
        Dashboard failed to load.
      </div>
    );
  }

  const {
    salary,
    totalSpent,
    remaining,
    dailyBudget,
    projected,
    projectedOverspend,
    spentPercentage,
    health,
    dailyBudgetMessage,
    ignoredWarnings,
    behavior,
    streak,
    suggestions,
  } = data;

  const progressTone =
    spentPercentage >= 85
      ? "bg-red-500"
      : spentPercentage >= 60
      ? "bg-orange-500"
      : "bg-emerald-500";

  const heroTone = {
    danger: "bg-red-600",
    warning: "bg-amber-500",
    safe: "bg-emerald-600",
    empty: "bg-slate-700",
  };

  const behaviorTone =
    behavior?.tone === "danger"
      ? "bg-red-50 text-red-700 border-red-100"
      : behavior?.tone === "warning"
      ? "bg-orange-50 text-orange-700 border-orange-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-100";
  const currentMonthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <section
        className={`rounded-[2rem] ${
          heroTone[health.status]
        } p-4 text-white shadow-xl sm:p-6 md:p-8`}
      >
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          <div>
           <div className="flex flex-wrap items-center justify-between gap-4">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-sm font-black text-white">
      {user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "CG"}
    </div>

    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
        {user?.name || "CashGuard User"}
      </p>
      <p className="text-xs text-white/40">
        {user?.email}
      </p>
    </div>
  </div>

  <div className="flex flex-wrap gap-2 text-xs font-semibold text-white/60">
    <span className="rounded-xl bg-white/10 px-3 py-1">
      {currentMonthLabel}
    </span>
    <span className="rounded-xl bg-white/10 px-3 py-1">
      {ignoredWarnings} warnings
    </span>
    <span className="rounded-xl bg-white/10 px-3 py-1">
      {streak} day streak
    </span>
  </div>
</div>

            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl md:text-5xl">
              {health.title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
              {health.message}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
              <Link
                to="/expenses"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100 sm:w-auto"
              >
                <Plus size={18} />
                Add Expense
              </Link>

              <Link
                to="/budget"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                <Target size={18} />
                Plan Budget
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:p-5">
            <p className="text-sm text-white/60">Safe to spend today</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Rs. {dailyBudget.toLocaleString()}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              {dailyBudgetMessage || "This is today’s limit. Cross it and your month gets weaker."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard title="Salary" value={`Rs. ${salary.toLocaleString()}`} icon={<Wallet />} tone="emerald" />
        <DashboardStatCard title="Spent" value={`Rs. ${totalSpent.toLocaleString()}`} icon={<TrendingDown />} tone="red" />
        <DashboardStatCard title="Remaining" value={`Rs. ${remaining.toLocaleString()}`} icon={<PiggyBank />} tone="blue" />
        <DashboardStatCard title="Daily Budget" value={`Rs. ${dailyBudget.toLocaleString()}`} icon={<CalendarDays />} tone="violet" />
      </section>

      <section className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <SurfaceCard className="lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold">Monthly Usage</h2>
              <p className="mt-1 text-sm text-slate-500">
                How much of your salary is already gone.
              </p>
            </div>

            <p className="text-3xl font-black">{spentPercentage}%</p>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${progressTone}`}
              style={{ width: `${spentPercentage}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-slate-500">
            <span>Spent: Rs. {totalSpent.toLocaleString()}</span>
            <span>Salary: Rs. {salary.toLocaleString()}</span>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <div className="flex items-center gap-3">
            <Wallet className="text-emerald-600" />
            <h2 className="text-lg font-bold">Salary</h2>
          </div>

          <input
            type="number"
            placeholder="e.g. 150000"
            className="input mt-5 px-5 py-4 text-lg font-semibold"
            value={salaryInput}
            onChange={(e) => {
              setIsSalaryDirty(true);
              setSalaryDraft(e.target.value);
            }}
          />

          <button
            onClick={handleSalarySave}
            disabled={savingSalary}
            className="mt-4 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingSalary ? "Saving..." : "Save Salary"}
          </button>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <DashboardInsightCard
          icon={<Brain />}
          title="Projection"
          value={`Rs. ${projected.toLocaleString()}`}
          message={
            salary <= 0
              ? "Set salary to compare projection."
              : projectedOverspend > 0
              ? `You may overspend by Rs. ${projectedOverspend.toLocaleString()}.`
              : `Projected safe by Rs. ${Math.abs(projectedOverspend).toLocaleString()}.`
          }
          danger={salary > 0 && projectedOverspend > 0}
        />

       <button onClick={fetchWarnings} className="w-full text-left">
  <DashboardInsightCard
    icon={behavior?.tone === "danger" ? <AlertTriangle /> : <ShieldCheck />}
    title="Behavior"
    value={`${ignoredWarnings} ignored`}
    message={`${behavior?.message} Click to view skipped warnings.`}
    className={`${behaviorTone} cursor-pointer transition hover:scale-[1.01]`}
  />
</button>

        <DashboardInsightCard
          icon={<Trophy />}
          title="Streak"
          value={`${streak} day${streak !== 1 ? "s" : ""}`}
          message={
            streak === 0
              ? "Start again today. No drama, just discipline."
              : "You stayed within budget. Keep the chain alive."
          }
          className={streak > 0 ? "border-emerald-100 bg-emerald-50 text-emerald-700" : ""}
        />
      </section>

      <section>
        <SurfaceCard>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">What You Should Do Now</h2>
              <p className="mt-1 text-sm text-slate-500">
                Direct actions based on your current spending.
              </p>
            </div>

            <Link
              to="/reports"
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              View reports
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {suggestions.slice(0, 4).map((item) => (
              <SuggestionChip key={item} text={item} />
            ))}
          </div>
        </SurfaceCard>
      </section>
      {showWarnings && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-3 pb-3 pt-20 sm:items-center sm:p-4">
    <div className="w-full max-w-2xl rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">
            Ignored Warnings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            These are the warnings you skipped.
          </p>
        </div>

        <button
          onClick={() => setShowWarnings(false)}
          className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
        >
          Close
        </button>
      </div>

      <div className="mt-5 max-h-[65vh] space-y-3 overflow-y-auto">
        {warnings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No ignored warnings yet.
          </div>
        ) : (
          warnings.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-red-100 bg-red-50 p-4"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase text-red-600">
                    {item.type}
                  </p>
                  <h3 className="mt-1 font-bold text-red-900">
                    {item.reason}
                  </h3>
                </div>

                <p className="text-sm font-bold text-red-700">
                  Rs. {Number(item.amount).toLocaleString()}
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold leading-6 text-red-700">
                {item.message}
              </p>

              <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs font-semibold text-red-500">
                <span>{item.category}</span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
