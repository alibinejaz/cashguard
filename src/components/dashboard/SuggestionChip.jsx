export default function SuggestionChip({ text }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium leading-6 text-slate-700 shadow-sm">
      {text}
    </div>
  );
}
