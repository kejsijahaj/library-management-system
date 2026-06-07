const BooksPage = () => (
  <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="border-y-2 border-ink py-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cinnabar">Phase 4</p>
        <h2 className="mt-3 font-display text-5xl font-bold">Book catalog CRUD</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink/75">
          The catalog will become a dense, book-spine inspired table with search, filters, copy counts, and a slide-over editor.
        </p>
      </div>
      <div className="min-h-48 -rotate-2 border-2 border-ink bg-chartreuse p-6 shadow-hard transition duration-300 hover:rotate-0">
        <p className="font-display text-3xl font-bold">Not a generic card grid.</p>
      </div>
    </div>
  </section>
);

export default BooksPage;
