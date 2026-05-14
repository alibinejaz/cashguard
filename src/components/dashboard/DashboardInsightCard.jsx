export default function DashboardInsightCard({
  icon,
  title,
  value,
  message,
  danger = false,
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ${
        className ||
        (danger
          ? "border-red-100 bg-red-50/90 text-red-700"
          : "border-slate-200/80 bg-white/90 text-slate-950")
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">{icon}</div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <h3 className="mt-5 text-2xl font-black">{value}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 opacity-80">{message}</p>
    </div>
  );
}
