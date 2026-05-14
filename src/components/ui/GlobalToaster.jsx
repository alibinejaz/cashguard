import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore } from "../../store/useToastStore";

const toastStyles = {
  success: {
    bg: "bg-emerald-600",
    icon: <CheckCircle size={20} />,
  },
  warning: {
    bg: "bg-amber-500",
    icon: <AlertTriangle size={20} />,
  },
  error: {
    bg: "bg-red-600",
    icon: <AlertTriangle size={20} />,
  },
  info: {
    bg: "bg-slate-900",
    icon: <Info size={20} />,
  },
};

export default function GlobalToaster() {
  const toast = useToastStore((s) => s.toast);
  const hideToast = useToastStore((s) => s.hideToast);

  const style = toastStyles[toast?.type] || toastStyles.info;

  if (!toast) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-[9999] flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-white shadow-xl sm:right-6 sm:top-6 ${style.bg}`}
    >
      <div className="mt-0.5">{style.icon}</div>

      <p className="text-sm font-medium leading-5">{toast.message}</p>

      <button
        onClick={hideToast}
        className="ml-2 rounded-lg p-1 hover:bg-white/15"
      >
        <X size={16} />
      </button>
    </div>
  );
}
