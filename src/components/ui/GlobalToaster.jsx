import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore } from "../../store/useToastStore";

const toastStyles = {
  success: {
    bg: "bg-emerald-600",
    icon: <CheckCircle size={20} />,
  },
  warning: {
    bg: "bg-orange-500",
    icon: <AlertTriangle size={20} />,
  },
  error: {
    bg: "bg-red-600",
    icon: <AlertTriangle size={20} />,
  },
  info: {
    bg: "bg-slate-950",
    icon: <Info size={20} />,
  },
};

export default function GlobalToaster() {
  const toast = useToastStore((s) => s.toast);
  const hideToast = useToastStore((s) => s.hideToast);

  const style = toastStyles[toast?.type] || toastStyles.info;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`fixed right-6 top-6 z-[9999] flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-white shadow-xl ${style.bg}`}
        >
          <div className="mt-0.5">{style.icon}</div>

          <p className="text-sm font-medium leading-5">{toast.message}</p>

          <button
            onClick={hideToast}
            className="ml-2 rounded-lg p-1 hover:bg-white/15"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}