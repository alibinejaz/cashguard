import SurfaceCard from "./SurfaceCard";

export default function MetricCard({ title, value }) {
  return (
    <SurfaceCard>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:mt-3 sm:text-2xl">
        {value}
      </h2>
    </SurfaceCard>
  );
}
