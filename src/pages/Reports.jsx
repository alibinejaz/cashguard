import { useEffect, useState } from "react";
import { ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import SpendingBreakdownChart from "../components/charts/SpendingBreakdownChart";
import PageHeader from "../components/common/PageHeader";
import SurfaceCard from "../components/common/SurfaceCard";
import MetricCard from "../components/common/MetricCard";
import EmptyState from "../components/common/EmptyState";
import WeeklyMiniCard from "../components/reports/WeeklyMiniCard";
import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useReportsQuery } from "../hooks/useReports";

export default function Reports() {
    const token = useAuthStore((s) => s.token);
    const showToast = useToastStore((s) => s.showToast);
    const [reportType, setReportType] = useState("month");
    const [month, setMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    });
    const [fromMonth, setFromMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-01`;
    });
    const [toMonth, setToMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    });
    const [year, setYear] = useState(() => String(new Date().getFullYear()));
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const reportParams =
        reportType === "range"
            ? { from: fromMonth, to: toMonth }
            : reportType === "year"
            ? { year }
            : { month };
    const {
        data,
        isError,
        error,
    } = useReportsQuery(token, reportParams);

    useEffect(() => {
        if (isError && error) {
            showToast(error.message || "Failed to load reports", "error");
        }
    }, [isError, error, showToast]);

    const reportData = data ?? {
        salary: 0,
        totalSpent: 0,
        remaining: 0,
        dailyBudget: 0,
        biggestLeak: null,
        categorySummary: [],
        weeklyTrends: {
            currentWeekSpent: 0,
            lastWeekSpent: 0,
            trend: "none",
            message: "No weekly data available yet.",
        },
        expenses: [],
    };

    if (isError && !data) {
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
    } = reportData;

    const leakInsight = biggestLeak
        ? `${biggestLeak.category} is your biggest spending category at ${biggestLeak.percentage}%. Control this first.`
        : "Add expenses to see which category is eating your money.";
    const leakTone =
        (biggestLeak?.percentage || 0) >= 45
            ? "text-red-600"
            : (biggestLeak?.percentage || 0) >= 25
            ? "text-amber-600"
            : "text-slate-900";

    const buildCsvContent = () => {
        const header = ["Date", "Category", "Note", "Amount"];
        const rows = expenses.map((item) => [
            new Date(item.date).toLocaleDateString(),
            item.category,
            item.note,
            Number(item.amount).toString(),
        ]);
        return [header, ...rows]
            .map((row) =>
                row
                    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                    .join(",")
            )
            .join("\n");
    };

    const handleDownloadCsv = () => {
        const csvContent = buildCsvContent();
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `cashguard-report-${getReportLabel()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloadMenuOpen(false);
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const reportTitle = `CashGuard Report - ${getReportLabel()}`;

        doc.setFontSize(16);
        doc.text(reportTitle, 14, 16);
        doc.setFontSize(11);
        doc.text(`Salary: Rs. ${salary.toLocaleString()}`, 14, 28);
        doc.text(`Spent: Rs. ${totalSpent.toLocaleString()}`, 14, 35);
        doc.text(`Remaining: Rs. ${remaining.toLocaleString()}`, 14, 42);
        doc.text(`Daily Safe Budget: Rs. ${dailyBudget.toLocaleString()}`, 14, 49);

        let y = 62;
        doc.setFontSize(12);
        doc.text("Expenses", 14, y);
        y += 8;

        doc.setFontSize(10);
        doc.text("Date", 14, y);
        doc.text("Category", 50, y);
        doc.text("Note", 90, y);
        doc.text("Amount", 180, y, { align: "right" });
        y += 6;

        doc.setLineWidth(0.2);
        doc.line(14, y, 196, y);
        y += 6;

        if (expenses.length === 0) {
            doc.text("No expenses for this month.", 14, y);
        } else {
            expenses.forEach((item) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }

                const dateText = new Date(item.date).toLocaleDateString();
                const noteText = String(item.note || "-").slice(0, 28);
                const amountText = `Rs. ${Number(item.amount).toLocaleString()}`;

                doc.text(dateText, 14, y);
                doc.text(String(item.category), 50, y);
                doc.text(noteText, 90, y);
                doc.text(amountText, 180, y, { align: "right" });
                y += 7;
            });
        }

        doc.save(`cashguard-report-${getReportLabel()}.pdf`);
        setDownloadMenuOpen(false);
    };

    const getReportLabel = () => {
        if (reportType === "range") return `${fromMonth}-to-${toMonth}`;
        if (reportType === "year") return year;
        return month;
    };

    return (
        <div className="mx-auto max-w-6xl">
            <PageHeader
                title="Reports"
                subtitle="Read your money behavior clearly. No guessing, no excuses."
            />

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Report Month</p>
                    <p className="text-xs text-slate-500">
                        Choose report type and relevant period filter.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    >
                        <option value="month">1 month</option>
                        <option value="range">Multiple months</option>
                        <option value="year">Yearly report</option>
                    </select>

                    {reportType === "month" && (
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        />
                    )}

                    {reportType === "range" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
                            <input
                                type="month"
                                value={fromMonth}
                                onChange={(e) => setFromMonth(e.target.value)}
                                className="w-full rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                title="From month"
                            />
                            <input
                                type="month"
                                value={toMonth}
                                onChange={(e) => setToMonth(e.target.value)}
                                className="w-full rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                title="To month"
                            />
                        </div>
                    )}

                    {reportType === "year" && (
                        <input
                            type="number"
                            min="2000"
                            max="2100"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full rounded-xl border border-slate-200/80 bg-white/85 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 sm:w-32"
                            title="Year"
                        />
                    )}
                    </div>

                    <div className="relative md:justify-self-end">
                        <button
                            type="button"
                            onClick={() => setDownloadMenuOpen((prev) => !prev)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 md:min-w-[9rem]"
                        >
                            Download
                            <ChevronDown size={16} />
                        </button>

                        {downloadMenuOpen && (
                            <div className="absolute right-0 z-20 mt-2 w-full min-w-[11rem] rounded-xl border border-slate-200 bg-white p-1 shadow-lg md:w-44">
                                <button
                                    type="button"
                                    onClick={handleDownloadCsv}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    <FileSpreadsheet size={16} />
                                    Download CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadPdf}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    <FileText size={16} />
                                    Download PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Monthly Salary" value={`Rs. ${salary.toLocaleString()}`} />
                <MetricCard title="Total Spent" value={`Rs. ${totalSpent.toLocaleString()}`} />
                <MetricCard title="Remaining" value={`Rs. ${remaining.toLocaleString()}`} />
                <MetricCard title="Daily Safe Budget" value={`Rs. ${dailyBudget.toLocaleString()}`} />
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
                <SurfaceCard>
                    <h2 className="text-lg font-bold">Biggest Leak</h2>
                    <h3 className={`mt-4 text-2xl font-black sm:mt-5 sm:text-3xl ${leakTone}`}>
                        {biggestLeak?.category || "No data"}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        {leakInsight}
                    </p>
                </SurfaceCard>

                <SurfaceCard>
                    <h2 className="text-lg font-bold">Spending Breakdown</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Visual category split.
                    </p>

                    <SpendingBreakdownChart expenses={expenses} />
                </SurfaceCard>
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
                <SurfaceCard>
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
                </SurfaceCard>

                <SurfaceCard>
                    <h2 className="text-lg font-bold">Weekly Summary</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Check whether your spending is improving or getting worse.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <WeeklyMiniCard
                            label="This Week"
                            value={`Rs. ${weeklyTrends.currentWeekSpent.toLocaleString()}`}
                        />
                        <WeeklyMiniCard
                            label="Last Week"
                            value={`Rs. ${weeklyTrends.lastWeekSpent.toLocaleString()}`}
                        />
                        <WeeklyMiniCard
                            label="Trend"
                            value={weeklyTrends.trend === "none" ? "No Data" : weeklyTrends.trend}
                            dark
                        />
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                        {weeklyTrends.message}
                    </div>
                </SurfaceCard>
            </section>

            <SurfaceCard className="mt-6">
                <h2 className="text-lg font-bold">Expense Records</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Full list of logged expenses.
                </p>

                <div className="mt-6 space-y-3 md:hidden">
                    {expenses.length === 0 ? (
                        <EmptyState text="No expenses added yet." />
                    ) : (
                        expenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900">
                                            {expense.category}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-black text-slate-950">
                                        Rs. {Number(expense.amount).toLocaleString()}
                                    </p>
                                </div>
                                <p className="mt-2 break-words text-sm text-slate-600">
                                    {expense.note}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
                    <table className="min-w-[640px] w-full text-left text-sm">
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
            </SurfaceCard>
        </div>
    );
}
