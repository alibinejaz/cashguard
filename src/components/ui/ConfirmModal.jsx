import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  delay = 3,
}) {
  const [countdown, setCountdown] = useState(delay);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(delay);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, delay]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[9999] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <AlertTriangle />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                <p className="text-xs font-medium text-red-500">
                  Unsafe spending detected
                </p>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
              {message}
            </p>

            {countdown > 0 && (
              <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                Pause. Think first. Continue available in {countdown}s.
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={countdown > 0}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
                  countdown > 0
                    ? "cursor-not-allowed bg-red-300"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {countdown > 0 ? `Wait ${countdown}s` : "Continue"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}