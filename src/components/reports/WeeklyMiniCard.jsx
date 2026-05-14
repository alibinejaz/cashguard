export default function WeeklyMiniCard({ label, value, dark = false }) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-950"
      }`}
    >
      <p className={`text-sm ${dark ? "text-slate-300" : "text-slate-500"}`}>
        {label}
      </p>
      <h3 className="mt-2 text-lg font-black capitalize">{value}</h3>
    </div>
  );
}
