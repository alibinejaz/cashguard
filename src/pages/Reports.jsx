import { useEffect } from "react";
import SpendingBreakdownChart from "../components/charts/SpendingBreakdownChart";
import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useReportsQuery } from "../hooks/useReports";

export default function Reports() {
    const token = useAuthStore((s) => s.token);
    const showToast = useToastStore((s) => s.showToast);
    const { data, isLoading: loading, isError, error } = useReportsQuery(token);

    useEffect(() => {
        if (isError && error) {
            showToast(error.message || "Failed to load reports", "error");
        }
    }, [isError, error, showToast]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-sm font-bold text-slate-500">
                Loading reports...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
                Reports failed to load.
            </div>
        );
    }

    const {
        salary,
        totalSpent,
        remaining,
        dailyBudget,
        biggestLeak,
        categorySummary,
        weeklyTrends,
        expenses,
    } = data;

    const leakInsight = biggestLeak
        ? `${biggestLeak.category} is your biggest spending category at ${biggestLeak.percentage}%. Control this first.`
        : "Add expenses to see which category is eating your money.";

    return (
        <div className="mx-auto max-w-6xl">
            <div className="border-b border-slate-200 pb-6">
                <p className="text-sm font-semibold text-emerald-600">CashGuard</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight">Reports</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Read your money behavior clearly. No guessing, no excuses.
                </p>
            </div>

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <ReportCard title="Monthly Salary" value={`Rs. ${salary.toLocaleString()}`} />
                <ReportCard title="Total Spent" value={`Rs. ${totalSpent.toLocaleString()}`} />
                <ReportCard title="Remaining" value={`Rs. ${remaining.toLocaleString()}`} />
                <ReportCard title="Daily Safe Budget" value={`Rs. ${dailyBudget.toLocaleString()}`} />
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Biggest Leak</h2>
                    <h3 className="mt-5 text-3xl font-black">
                        {biggestLeak?.category || "No data"}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        {leakInsight}
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Spending Breakdown</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Visual category split.
                    </p>

                    <SpendingBreakdownChart expenses={expenses} />
                </div>
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Category Summary</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Where your money is actually going.
                    </p>

                    <div className="mt-6 space-y-4">
                        {categorySummary.length === 0 ? (
                            <EmptyState text="No category data yet." />
                        ) : (
                            categorySummary.map((item) => (
                                <div key={item.category}>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span className="font-semibold text-slate-700">
                                            {item.category}
                                        </span>
                                        <span className="font-bold text-slate-950">
                                            Rs. {item.amount.toLocaleString()} • {item.percentage}%
                                        </span>
                                    </div>

                                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-slate-950"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold">Weekly Summary</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Check whether your spending is improving or getting worse.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <MiniCard
                            label="This Week"
                            value={`Rs. ${weeklyTrends.currentWeekSpent.toLocaleString()}`}
                        />
                        <MiniCard
                            label="Last Week"
                            value={`Rs. ${weeklyTrends.lastWeekSpent.toLocaleString()}`}
                        />
                        <MiniCard
                            label="Trend"
                            value={weeklyTrends.trend === "none" ? "No Data" : weeklyTrends.trend}
                            dark
                        />
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                        {weeklyTrends.message}
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Expense Records</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Full list of logged expenses.
                </p>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Category</th>
                                <th className="px-4 py-3 font-semibold">Note</th>
                                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-10 text-center text-slate-400">
                                        No expenses added yet.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="bg-white">
                                        <td className="px-4 py-4 text-slate-600">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-900">
                                            {expense.category}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">{expense.note}</td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-950">
                                            Rs. {Number(expense.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function ReportCard({ title, value }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                {value}
            </h2>
        </div>
    );
}

function MiniCard({ label, value, dark = false }) {
    return (
        <div
            className={`rounded-2xl p-4 ${dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-950"
                }`}
        >
            <p className={`text-sm ${dark ? "text-slate-300" : "text-slate-500"}`}>
                {label}
            </p>
            <h3 className="mt-2 text-lg font-black capitalize">{value}</h3>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            {text}
        </div>
    );
}
