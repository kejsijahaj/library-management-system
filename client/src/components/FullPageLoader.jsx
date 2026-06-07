const FullPageLoader = () => (
  <main className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
    <div className="relative">
      <div className="h-24 w-24 animate-pulse border-2 border-ink bg-chartreuse shadow-hard" />
      <div className="absolute -right-8 -top-7 h-20 w-20 border-2 border-ink bg-brass" />
      <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.32em] text-mineral">Loading desk</p>
    </div>
  </main>
);

export default FullPageLoader;
