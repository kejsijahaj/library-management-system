import { BookOpenCheck } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const quickAccessAccounts = [
  { label: "Admin", email: "admin@library.test" },
  { label: "Librarian", email: "librarian@library.test" },
  { label: "Member", email: "member@library.test" }
];

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = location.state?.from?.pathname || "/";
  const canSubmit = useMemo(() => form.email.trim() && form.password.trim() && !isSubmitting, [form.email, form.password, isSubmitting]);

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const useQuickAccessAccount = useCallback((email) => {
    setError("");
    setForm({ email, password: "Password123!" });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login({
        email: form.email,
        password: form.password
      });

      navigate(destination === "/login" ? (user.role === "member" ? "/my-library" : "/") : destination, { replace: true });
    } catch (authError) {
      setError(getApiError(authError, "Could not sign in."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between p-6 md:p-10">
          <div className="flex h-14 w-14 rotate-[-8deg] items-center justify-center bg-chartreuse text-ink shadow-hard">
            <BookOpenCheck size={28} />
          </div>
          <div className="max-w-3xl py-16">
            <p className="text-sm font-bold uppercase tracking-[0.34em] text-chartreuse">Library Management</p>
            <h1 className="mt-5 font-display text-6xl font-bold leading-none md:text-8xl">A sharper desk for busy shelves.</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAccessAccounts.map((account) => (
              <button
                className="border-2 border-paper/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] transition hover:-translate-y-1 hover:border-chartreuse hover:text-chartreuse"
                key={account.email}
                onClick={() => useQuickAccessAccount(account.email)}
                type="button"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center bg-paper p-6 text-ink md:p-10">
          <form className="w-full max-w-md border-2 border-ink bg-parchment p-6 shadow-hard" onSubmit={handleSubmit}>
            <h2 className="font-display text-4xl font-bold">Sign in</h2>
            {error ? <p className="mt-4 border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{error}</p> : null}
            <label className="mt-6 block text-sm font-bold uppercase tracking-[0.16em]">
              Email
              <input
                autoComplete="email"
                className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse"
                name="email"
                onChange={updateField}
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="mt-4 block text-sm font-bold uppercase tracking-[0.16em]">
              Password
              <input
                autoComplete="current-password"
                className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse"
                name="password"
                onChange={updateField}
                required
                type="password"
                value={form.password}
              />
            </label>
            <button
              className="mt-6 w-full bg-ink px-5 py-3 font-bold text-paper transition duration-200 hover:-translate-y-1 hover:bg-mineral disabled:cursor-not-allowed disabled:bg-ink/50 disabled:hover:translate-y-0"
              disabled={!canSubmit}
              type="submit"
            >
              {isSubmitting ? "Checking shelves..." : "Enter system"}
            </button>
            <p className="mt-5 text-sm">
              New member?{" "}
              <Link className="font-bold underline decoration-cinnabar decoration-2 underline-offset-4" to="/register">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
