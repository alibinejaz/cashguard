import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-950">
      <div className="flex">
        <Sidebar />

        <main className="min-h-screen flex-1 px-5 py-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}