import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const fields = [
  { autoComplete: "name", label: "Name", name: "name", type: "text" },
  { autoComplete: "email", label: "Email", name: "email", type: "email" },
  { autoComplete: "tel", label: "Phone", name: "phone", type: "text" },
  { autoComplete: "new-password", label: "Password", name: "password", type: "password" }
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", name: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => form.name.trim() && form.email.trim() && form.password.trim().length >= 6 && !isSubmitting,
    [form.email, form.name, form.password, isSubmitting]
  );

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/my-library", { replace: true });
    } catch (registerError) {
      setError(getApiError(registerError, "Could not create member account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper p-6 text-ink md:p-10">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="border-y-2 border-ink py-8">
          <p className="text-sm font-bold uppercase tracking-[0.34em] text-cinnabar">Member access</p>
          <h1 className="mt-5 font-display text-6xl font-bold leading-none">Join the library ledger.</h1>
          <p className="mt-5 text-lg text-ink/70">Public registration creates member accounts only. Staff accounts are created by admins.</p>
        </div>
        <form className="border-2 border-ink bg-ink p-6 text-paper shadow-hard md:p-8" onSubmit={handleSubmit}>
          <h2 className="font-display text-4xl font-bold">Register</h2>
          {error ? <p className="mt-4 border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{error}</p> : null}
          {fields.map((field) => (
            <label className="mt-4 block text-sm font-bold uppercase tracking-[0.16em]" key={field.name}>
              {field.label}
              <input
                autoComplete={field.autoComplete}
                className="mt-2 w-full border-2 border-paper bg-ink px-4 py-3 text-paper outline-none transition focus:bg-chartreuse focus:text-ink"
                name={field.name}
                onChange={updateField}
                required={field.name !== "phone"}
                type={field.type}
                value={form[field.name]}
              />
            </label>
          ))}
          <button
            className="mt-6 w-full bg-chartreuse px-5 py-3 font-bold text-ink transition duration-200 hover:-translate-y-1 hover:bg-brass disabled:cursor-not-allowed disabled:bg-paper/25 disabled:text-paper disabled:hover:translate-y-0"
            disabled={!canSubmit}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Create member account"}
          </button>
          <p className="mt-5 text-sm text-paper/75">
            Already registered?{" "}
            <Link className="font-bold text-chartreuse underline underline-offset-4" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;
