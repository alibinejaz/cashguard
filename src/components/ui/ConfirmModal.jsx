import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  subtitle = "Please confirm this action",
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  tone = "danger",
}) {
  if (!isOpen) return null;

  const isDanger = tone === "danger";

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="fixed left-1/2 top-1/2 z-[9999] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-2xl p-3 ${
              isDanger ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"
            }`}
          >
            <AlertTriangle />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            <p
              className={`text-xs font-medium ${
                isDanger ? "text-red-500" : "text-slate-500"
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
              isDanger ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
