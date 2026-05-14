import SurfaceCard from "../common/SurfaceCard";

export default function DashboardStatCard({ title, value, icon, tone }) {
  const tones = {
    emerald: "bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200",
    red: "bg-rose-100/80 text-rose-700 ring-1 ring-rose-200",
    blue: "bg-sky-100/80 text-sky-700 ring-1 ring-sky-200",
    violet: "bg-violet-100/80 text-violet-700 ring-1 ring-violet-200",
  };

  return (
    <SurfaceCard>
      <div className={`inline-flex rounded-2xl p-3 ${tones[tone]}`}>{icon}</div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{title}</p>
      <h3 className="mt-2 break-words text-xl font-black tracking-tight sm:text-2xl">
        {value}
      </h3>
    </SurfaceCard>
  );
}
