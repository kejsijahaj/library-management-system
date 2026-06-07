const DashboardPage = () => (
  <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
    <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
      <div className="relative min-h-80 bg-ink p-8 text-paper shadow-glow">
        <p className="text-sm font-bold uppercase tracking-[0.32em] text-chartreuse">Phase 1</p>
        <h2 className="mt-6 max-w-xl font-display text-6xl font-bold leading-none md:text-7xl">
          System shell is ready.
        </h2>
        <p className="mt-6 max-w-lg text-paper/75">
          Backend and frontend foundations are in place. The next push adds MongoDB models, JWT auth, and business rules.
        </p>
        <div className="absolute -bottom-8 right-8 hidden w-44 border-2 border-ink bg-brass p-5 text-ink shadow-hard md:block">
          <p className="font-display text-4xl font-bold">5</p>
          <p className="text-sm font-bold uppercase tracking-[0.18em]">push phases</p>
        </div>
      </div>
      <div className="grid content-start gap-4 pt-10 md:grid-cols-2 lg:pt-24">
        {["Atlas setup", "Express MVC", "React Router", "Tailwind tokens"].map((item, index) => (
          <div
            className="border-l-8 border-ink bg-parchment p-5 transition duration-300 hover:-translate-y-1 hover:bg-chartreuse"
            key={item}
          >
            <p className="font-display text-4xl font-bold">0{index + 1}</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default DashboardPage;
