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
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-500 shadow-sm">
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
    danger: "from-red-950 via-red-900 to-red-700",
    warning: "from-orange-950 via-orange-900 to-orange-600",
    safe: "from-slate-950 via-slate-900 to-emerald-800",
    empty: "from-slate-950 via-slate-900 to-slate-700",
  };

  const behaviorTone =
    behavior?.tone === "danger"
      ? "bg-red-50 text-red-700 border-red-100"
      : behavior?.tone === "warning"
      ? "bg-orange-50 text-orange-700 border-orange-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-100";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[2rem] bg-gradient-to-br ${
          heroTone[health.status]
        } p-6 text-white shadow-xl md:p-8`}
      >
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          <div>
           <div className="flex items-center justify-between gap-4">
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

  <div className="flex gap-2 text-xs font-semibold text-white/60">
    <span className="rounded-xl bg-white/10 px-3 py-1">
      {ignoredWarnings} warnings
    </span>
    <span className="rounded-xl bg-white/10 px-3 py-1">
      {streak} day streak
    </span>
  </div>
</div>

            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              {health.title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
              {health.message}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/expenses"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                <Plus size={18} />
                Add Expense
              </Link>

              <Link
                to="/budget"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Target size={18} />
                Plan Budget
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/60">Safe to spend today</p>
            <h2 className="mt-2 text-4xl font-black">
              Rs. {dailyBudget.toLocaleString()}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              This is today’s limit. Cross it and your month gets weaker.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Salary" value={`Rs. ${salary.toLocaleString()}`} icon={<Wallet />} tone="emerald" />
        <StatCard title="Spent" value={`Rs. ${totalSpent.toLocaleString()}`} icon={<TrendingDown />} tone="red" />
        <StatCard title="Remaining" value={`Rs. ${remaining.toLocaleString()}`} icon={<PiggyBank />} tone="blue" />
        <StatCard title="Daily Budget" value={`Rs. ${dailyBudget.toLocaleString()}`} icon={<CalendarDays />} tone="violet" />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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

          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>Spent: Rs. {totalSpent.toLocaleString()}</span>
            <span>Salary: Rs. {salary.toLocaleString()}</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Wallet className="text-emerald-600" />
            <h2 className="text-lg font-bold">Salary</h2>
          </div>

          <input
            type="number"
            placeholder="e.g. 150000"
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg font-semibold outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
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
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <InsightCard
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

       <button onClick={fetchWarnings} className="text-left">
  <InsightCard
    icon={behavior?.tone === "danger" ? <AlertTriangle /> : <ShieldCheck />}
    title="Behavior"
    value={`${ignoredWarnings} ignored`}
    message={`${behavior?.message} Click to view skipped warnings.`}
    className={`${behaviorTone} cursor-pointer transition hover:scale-[1.01]`}
  />
</button>

        <InsightCard
          icon={<Trophy />}
          title="Streak"
          value={`${streak} day${streak !== 1 ? "s" : ""}`}
          message={
            streak === 0
              ? "Start again today. No drama, just discipline."
              : "You stayed within budget. Keep the chain alive."
          }
        />
      </section>

      <section>
        <Card>
          <div className="flex items-center justify-between">
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
              <Suggestion key={item} text={item} />
            ))}
          </div>
        </Card>
      </section>
      {showWarnings && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
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

      <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto">
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

              <div className="mt-3 flex justify-between text-xs font-semibold text-red-500">
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

function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ title, value, icon, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <Card>
      <div className={`inline-flex rounded-2xl p-3 ${tones[tone]}`}>
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">{value}</h3>
    </Card>
  );
}

function InsightCard({ icon, title, value, message, danger = false, className = "" }) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm ${
        className ||
        (danger
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-950")
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/60 p-3">{icon}</div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <h3 className="mt-5 text-2xl font-black">{value}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 opacity-80">
        {message}
      </p>
    </div>
  );
}

function Suggestion({ text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700">
      {text}
    </div>
  );
}

function UserMiniCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <h3 className="mt-1 text-sm font-black text-slate-950">{value}</h3>
    </div>
  );
}
