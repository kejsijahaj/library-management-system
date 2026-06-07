import { BookOpenCheck } from "lucide-react";
import { Link } from "react-router-dom";

const LoginPage = () => (
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
        <p className="max-w-xl text-paper/65">Phase 3 will connect this form to JWT auth and protected routes.</p>
      </div>
      <div className="flex items-center bg-paper p-6 text-ink md:p-10">
        <form className="w-full max-w-md border-2 border-ink bg-parchment p-6 shadow-hard">
          <h2 className="font-display text-4xl font-bold">Sign in</h2>
          <label className="mt-6 block text-sm font-bold uppercase tracking-[0.16em]">
            Email
            <input className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" type="email" />
          </label>
          <label className="mt-4 block text-sm font-bold uppercase tracking-[0.16em]">
            Password
            <input className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" type="password" />
          </label>
          <button className="mt-6 w-full bg-ink px-5 py-3 font-bold text-paper transition duration-200 hover:-translate-y-1 hover:bg-mineral" type="button">
            Enter system
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

export default LoginPage;
