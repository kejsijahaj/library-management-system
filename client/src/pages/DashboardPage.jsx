import { api } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApiQuery } from "../hooks/useApiQuery.js";

const labels = {
  activeBooks: "Active books",
  activeLoans: "Active loans",
  fineTotal: "Fine total",
  overdueLoans: "Overdue",
  pendingReservations: "Pending holds",
  readyReservations: "Ready holds",
  reservations: "Reservations",
  totalBooks: "Total books",
  totalUsers: "Active users"
};

const formatValue = (key, value) => (key === "fineTotal" ? `$${Number(value || 0).toFixed(2)}` : value || 0);

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, error, isLoading } = useApiQuery(async () => {
    const response = await api.get("/dashboard");
    return response.data;
  }, []);

  const metrics = data?.metrics || {};
  const metricEntries = Object.entries(metrics);

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <div className="relative min-h-80 bg-ink p-8 text-paper shadow-glow">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-chartreuse">{user?.role || "member"} dashboard</p>
          <h2 className="mt-6 max-w-xl font-display text-6xl font-bold leading-none md:text-7xl">
            {user?.role === "member" ? "Your shelf, at a glance." : "The desk is live."}
          </h2>
          <p className="mt-6 max-w-lg text-paper/75">
            Live metrics from MongoDB Atlas, including overdue activity, reservations, and fine totals.
          </p>
          <div className="absolute -bottom-8 right-8 hidden w-48 border-2 border-ink bg-brass p-5 text-ink shadow-hard md:block">
            <p className="font-display text-4xl font-bold">{isLoading ? "..." : formatValue("fineTotal", metrics.fineTotal)}</p>
            <p className="text-sm font-bold uppercase tracking-[0.18em]">fine signal</p>
          </div>
        </div>

        <div className="grid content-start gap-4 pt-10 md:grid-cols-2 lg:pt-24">
          {error ? <EmptyState message={error} title="Dashboard could not load" /> : null}
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <div className="h-32 animate-pulse border-l-8 border-ink bg-parchment" key={index} />)
            : metricEntries.map(([key, value], index) => (
                <div className="border-l-8 border-ink bg-parchment p-5 transition duration-300 hover:-translate-y-1 hover:bg-chartreuse" key={key}>
                  <p className="font-display text-4xl font-bold">{formatValue(key, value)}</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em]">{labels[key] || key}</p>
                  <p className="mt-4 text-xs font-bold text-ink/45">0{index + 1}</p>
                </div>
              ))}
        </div>
      </div>

      {data?.mostBorrowedBooks?.length ? (
        <div className="mt-16 border-t-2 border-ink pt-6">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-mineral">Most borrowed</p>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {data.mostBorrowedBooks.map((book) => (
              <div className="min-h-36 border-2 border-ink bg-paper p-4 transition hover:-translate-y-1 hover:bg-chartreuse" key={book.bookId}>
                <p className="font-display text-2xl font-bold leading-tight">{book.title}</p>
                <p className="mt-2 text-sm text-ink/70">{book.author}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em]">{book.loans} loans</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default DashboardPage;
