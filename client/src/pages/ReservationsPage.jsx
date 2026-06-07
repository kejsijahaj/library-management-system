const ReservationsPage = () => (
  <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
    <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
      <div className="bg-cinnabar p-6 text-paper shadow-hard">
        <p className="font-display text-5xl font-bold">Queue</p>
      </div>
      <div className="border-t-2 border-ink pt-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cinnabar">Phase 4</p>
        <h2 className="mt-3 font-display text-5xl font-bold">Reservations</h2>
        <p className="mt-4 text-lg text-ink/75">
          Members will reserve unavailable books here, while staff manage ready, fulfilled, and cancelled reservations.
        </p>
      </div>
    </div>
  </section>
);

export default ReservationsPage;
