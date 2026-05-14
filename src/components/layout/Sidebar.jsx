import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Target,
  PiggyBank,
  FileBarChart2,
  Settings,
  ShieldCheck,
  X,
  CircleHelp,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Expenses", path: "/expenses", icon: ReceiptText },
  { label: "Budget Plan", path: "/budget", icon: Target },
  { label: "Plans", path: "/plans", icon: PiggyBank },
  { label: "Reports", path: "/reports", icon: FileBarChart2 },
  { label: "How It Works", path: "/how-cashguard-works", icon: CircleHelp },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { pathname } = useLocation();

  const handleNavigate = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/45 transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-72 flex-col border-r border-slate-800 bg-slate-950 px-4 py-5 text-slate-100 shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:w-72 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">CashGuard</h2>
              <p className="text-xs text-slate-300">Money survival system</p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigate}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Focus
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              Log spending daily and keep warnings low to stay in control.
            </p>
          </div>

        </div>
      </aside>
    </>
  );
}
