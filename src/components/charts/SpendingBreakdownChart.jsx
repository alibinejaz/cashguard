import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6", "#14b8a6", "#64748b"];

export default function SpendingBreakdownChart({ expenses }) {
    const data = Object.values(
        expenses.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = {
                    name: item.category,
                    value: 0,
                };
            }

            acc[item.category].value += item.amount;
            return acc;
        }, {})
    );

    if (data.length === 0) {
        return (
            <div className="mt-8 flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                No spending data yet
            </div>
        );
    }

    return (
        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-3">
                {data.map((item, index) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium text-slate-700">
                                {item.name}
                            </span>
                        </div>

                        <span className="text-sm font-bold text-slate-950">
                            Rs. {item.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}