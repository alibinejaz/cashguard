import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {useToastStore} from "../store/useToastStore";
import { useLoginMutation } from "../hooks/useAuthApi";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const showToast = useToastStore((state) => state.showToast);
  const loginMutation = useLoginMutation();
  const loading = loginMutation.isPending;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.email || !form.password) {
    showToast("Enter email and password", "error");
    return;
  }

  try {
    const data = await loginMutation.mutateAsync(form);
    login(data);
    showToast("Login successful", "success");
    navigate("/");
  } catch (error) {
    showToast(error?.message || "Server not reachable. Check backend.", "error");
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-950">CashGuard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Login and control your spending before it controls you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="input mt-2"
            />
          </div>

         <button
  type="submit"
  disabled={loading}
  className="w-full rounded-2xl bg-slate-950 py-3 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Logging in..." : "Login"}
</button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/signup" className="font-bold text-slate-950">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
