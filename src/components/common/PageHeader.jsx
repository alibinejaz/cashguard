export default function PageHeader({ title, subtitle }) {
  return (
    <div className="border-b border-slate-200/80 pb-6">
      <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
        CashGuard
      </p>
      <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
