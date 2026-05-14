export default function EmptyState({ text, className = "" }) {
  return (
    <div
      className={`flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400 ${className}`}
    >
      {text}
    </div>
  );
}
