import { Link, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Expenses", path: "/expenses" },
  { label: "Budget Plan", path: "/budget" },
  { label: "Reports", path: "/reports" },
  { label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  const navigate = useNavigate();
const logout = useAuthStore((state) => state.logout);

const handleLogout = () => {
  logout();
  navigate("/login");
};

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-6 py-6 lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold">CashGuard</h2>
          <p className="text-xs text-slate-500">Money survival system</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
  onClick={handleLogout}
  className="mt-auto w-full rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-100"
>
  Logout
</button>
    </aside>
  );
}