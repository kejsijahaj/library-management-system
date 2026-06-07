import { XCircle } from "lucide-react";
import { api, getApiError } from "../api/client.js";
import ActionButton from "../components/ActionButton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApiQuery } from "../hooks/useApiQuery.js";

const MyLibraryPage = () => {
  const { user } = useAuth();
  const { data, error, isLoading, refetch } = useApiQuery(async () => {
    const [dashboardResponse, loanResponse, reservationResponse] = await Promise.all([
      api.get("/dashboard"),
      api.get("/loans"),
      api.get("/reservations")
    ]);

    return {
      loans: loanResponse.data.loans,
      metrics: dashboardResponse.data.metrics,
      reservations: reservationResponse.data.reservations
    };
  }, []);

  const cancelReservation = async (reservation) => {
    try {
      await api.patch(`/reservations/${reservation._id}/cancel`);
      await refetch();
    } catch (cancelError) {
      window.alert(getApiError(cancelError));
    }
  };

  const loans = data?.loans || [];
  const reservations = data?.reservations || [];
  const metrics = data?.metrics || {};

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b-2 border-ink pb-8 lg:border-b-0 lg:border-r-2 lg:pr-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blueprint">Member shelf</p>
          <h2 className="mt-3 font-display text-5xl font-bold">My Library</h2>
          <p className="mt-4 text-lg text-ink/75">Private circulation view for {user?.name}.</p>
        </div>
        <div className="relative min-h-56 bg-ink p-6 text-paper shadow-glow">
          <div className="absolute -left-4 top-8 h-24 w-8 bg-chartreuse shadow-hard" />
          <div className="ml-6 grid gap-4 sm:grid-cols-3">
            {[
              ["activeLoans", "Active"],
              ["overdueLoans", "Overdue"],
              ["fineTotal", "Fines"]
            ].map(([key, label]) => (
              <div className="border-l-2 border-paper/30 pl-4" key={key}>
                <p className="font-display text-4xl font-bold">{key === "fineTotal" ? `$${Number(metrics[key] || 0).toFixed(2)}` : metrics[key] || 0}</p>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-chartreuse">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error ? <div className="mt-8"><EmptyState message={error} title="Library data could not load" /></div> : null}
      {isLoading ? <p className="mt-8 border-2 border-ink bg-parchment p-6 font-bold">Loading your account...</p> : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-mineral">Loans</p>
          <div className="mt-4 overflow-hidden border-2 border-ink">
            {!isLoading && !loans.length ? <EmptyState message="Borrowed books will appear here." title="No loans yet" /> : null}
            {loans.map((loan) => (
              <div className="border-b-2 border-ink bg-paper p-4 transition hover:bg-parchment" key={loan._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{loan.book?.title}</h3>
                    <p className="text-sm text-ink/70">{loan.book?.author}</p>
                  </div>
                  <StatusPill status={loan.isOverdue ? "overdue" : loan.status} />
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="font-bold">Due:</span> {new Date(loan.dueAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-bold">Fine:</span> ${Number(loan.computedFine || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cinnabar">Reservations</p>
          <div className="mt-4 overflow-hidden border-2 border-ink">
            {!isLoading && !reservations.length ? <EmptyState message="Reserve unavailable books from the catalog." title="No reservations yet" /> : null}
            {reservations.map((reservation) => (
              <div className="border-b-2 border-ink bg-paper p-4 transition hover:bg-parchment" key={reservation._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{reservation.book?.title}</h3>
                    <p className="text-sm text-ink/70">{reservation.book?.author}</p>
                  </div>
                  <StatusPill status={reservation.status} />
                </div>
                {["pending", "ready"].includes(reservation.status) ? (
                  <ActionButton className="mt-4" onClick={() => cancelReservation(reservation)} variant="danger">
                    <XCircle size={16} /> Cancel hold
                  </ActionButton>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyLibraryPage;
