import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Budget from "./pages/Budget";
import Plans from "./pages/Plans";
import Reports from "./pages/Reports";
import HowCashGuardWorks from "./pages/HowCashGuardWorks";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import GlobalToaster from "./components/ui/GlobalToaster";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="settings" element={<Settings />} />
          <Route path="budget" element={<Budget />} />
          <Route path="plans" element={<Plans />} />
          <Route path="reports" element={<Reports />} />
          <Route path="how-cashguard-works" element={<HowCashGuardWorks />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <GlobalToaster />
    </>
  );
}
