import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useSignupMutation } from "../hooks/useAuthApi";


const Signup = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const showToast = useToastStore((state) => state.showToast);
  const signupMutation = useSignupMutation();
  const loading = signupMutation.isPending;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.email || !form.password) {
    showToast("Fill all fields", "error");
    return;
  }

  if (form.password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const data = await signupMutation.mutateAsync(form);
    signup(data);
    showToast("Account created successfully", "success");
    navigate("/");
  } catch (error) {
    showToast(error?.message || "Server not reachable. Check backend.", "error");
  }
};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-950">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Start controlling spending behavior, not just tracking numbers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
            />
          </div>

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
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
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
              placeholder="Create password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
            />
          </div>

          <button
  type="submit"
  disabled={loading}
  className="w-full rounded-2xl bg-slate-950 py-3 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Creating account..." : "Create Account"}
</button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have account?{" "}
          <Link to="/login" className="font-bold text-slate-950">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
