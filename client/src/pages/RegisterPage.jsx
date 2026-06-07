import { Link } from "react-router-dom";

const RegisterPage = () => (
  <main className="min-h-screen bg-paper p-6 text-ink md:p-10">
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="border-y-2 border-ink py-8">
        <p className="text-sm font-bold uppercase tracking-[0.34em] text-cinnabar">Member access</p>
        <h1 className="mt-5 font-display text-6xl font-bold leading-none">Join the library ledger.</h1>
        <p className="mt-5 text-lg text-ink/70">Public registration creates member accounts only. Staff accounts are created by admins.</p>
      </div>
      <form className="border-2 border-ink bg-ink p-6 text-paper shadow-hard md:p-8">
        <h2 className="font-display text-4xl font-bold">Register</h2>
        {["Name", "Email", "Phone", "Password"].map((field) => (
          <label className="mt-4 block text-sm font-bold uppercase tracking-[0.16em]" key={field}>
            {field}
            <input
              className="mt-2 w-full border-2 border-paper bg-ink px-4 py-3 text-paper outline-none transition focus:bg-chartreuse focus:text-ink"
              type={field === "Password" ? "password" : field === "Email" ? "email" : "text"}
            />
          </label>
        ))}
        <button className="mt-6 w-full bg-chartreuse px-5 py-3 font-bold text-ink transition duration-200 hover:-translate-y-1 hover:bg-brass" type="button">
          Create member account
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

export default RegisterPage;
