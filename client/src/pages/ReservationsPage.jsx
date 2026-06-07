import { CheckCircle2, Edit3, Plus, Trash2, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { api, getApiError } from "../api/client.js";
import ActionButton from "../components/ActionButton.jsx";
import Drawer from "../components/Drawer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApiQuery } from "../hooks/useApiQuery.js";

const blankReservation = {
  book: "",
  member: "",
  status: "pending"
};

const ReservationsPage = () => {
  const { user } = useAuth();
  const isStaff = ["admin", "librarian"].includes(user?.role);
  const [status, setStatus] = useState("");
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [form, setForm] = useState(blankReservation);
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, refetch } = useApiQuery(async () => {
    const requests = [
      api.get("/reservations", { params: { status } }),
      api.get("/books", { params: { availability: "unavailable", status: "active" } })
    ];

    if (isStaff) {
      requests.push(api.get("/users/members"));
    }

    const [reservationResponse, bookResponse, memberResponse] = await Promise.all(requests);

    return {
      books: bookResponse.data.books,
      members: memberResponse?.data.members || [],
      reservations: reservationResponse.data.reservations
    };
  }, [isStaff, status]);

  const reservations = data?.reservations || [];
  const books = data?.books || [];
  const members = data?.members || [];
  const statusCounts = useMemo(
    () =>
      reservations.reduce((total, reservation) => {
        total[reservation.status] = (total[reservation.status] || 0) + 1;
        return total;
      }, {}),
    [reservations]
  );

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const openCreate = () => {
    setActionError("");
    setSelectedReservation(null);
    setForm(blankReservation);
    setDrawerMode("create");
  };

  const openEdit = (reservation) => {
    setActionError("");
    setSelectedReservation(reservation);
    setForm({
      book: reservation.book?._id || "",
      member: reservation.member?._id || "",
      status: reservation.status || "pending"
    });
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setActionError("");
    setSelectedReservation(null);
    setDrawerMode(null);
  };

  const createReservation = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");

    const payload = isStaff ? { book: form.book, member: form.member } : { book: form.book };

    try {
      await api.post("/reservations", payload);
      closeDrawer();
      await refetch();
    } catch (createError) {
      setActionError(getApiError(createError));
    } finally {
      setIsSaving(false);
    }
  };

  const updateReservation = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");

    try {
      await api.patch(`/reservations/${selectedReservation._id}`, { status: form.status });
      closeDrawer();
      await refetch();
    } catch (updateError) {
      setActionError(getApiError(updateError));
    } finally {
      setIsSaving(false);
    }
  };

  const cancelReservation = async (reservation) => {
    setActionError("");

    try {
      await api.patch(`/reservations/${reservation._id}/cancel`);
      await refetch();
    } catch (cancelError) {
      setActionError(getApiError(cancelError));
    }
  };

  const fulfillReservation = async (reservation) => {
    setActionError("");

    try {
      await api.patch(`/reservations/${reservation._id}/fulfill`);
      await refetch();
    } catch (fulfillError) {
      setActionError(getApiError(fulfillError));
    }
  };

  const deleteReservation = async (reservation) => {
    setActionError("");

    try {
      await api.delete(`/reservations/${reservation._id}`);
      await refetch();
    } catch (deleteError) {
      setActionError(getApiError(deleteError));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
        <div className="bg-cinnabar p-6 text-paper shadow-hard">
          <p className="font-display text-5xl font-bold">Queue</p>
          <p className="mt-6 text-paper/75">Pending: {statusCounts.pending || 0}</p>
          <p className="text-paper/75">Ready: {statusCounts.ready || 0}</p>
        </div>
        <div className="border-t-2 border-ink pt-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cinnabar">Reservations</p>
          <h2 className="mt-3 font-display text-5xl font-bold">Hold queue</h2>
          <p className="mt-4 text-lg text-ink/75">
            {isStaff ? "Manage pending, ready, fulfilled, and cancelled reservations." : "Place holds for unavailable books and track your queue."}
          </p>
          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <select className="min-h-12 border-2 border-ink bg-parchment px-4 font-bold" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="">All reservations</option>
              <option value="pending">Pending</option>
              <option value="ready">Ready</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ActionButton onClick={openCreate} variant="brass">
              <Plus size={18} /> New hold
            </ActionButton>
          </div>
        </div>
      </div>
      {actionError ? <p className="mt-4 border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}

      <div className="mt-8 overflow-hidden border-2 border-ink">
        {isLoading ? <p className="bg-parchment p-6 font-bold">Loading reservations...</p> : null}
        {error ? <EmptyState message={error} title="Reservations could not load" /> : null}
        {!isLoading && !reservations.length ? <EmptyState message="Create a hold from an unavailable book." title="No reservations found" /> : null}
        {reservations.map((reservation) => (
          <div className="grid gap-4 border-b-2 border-ink bg-paper p-4 transition hover:bg-parchment md:grid-cols-[1.2fr_1fr_1fr_auto]" key={reservation._id}>
            <div>
              <h3 className="font-display text-2xl font-bold">{reservation.book?.title}</h3>
              <p className="text-sm text-ink/70">{reservation.book?.author}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-mineral">{reservation.member?.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Status</p>
              <StatusPill status={reservation.status} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Ready date</p>
              <p className="font-bold">{reservation.readyAt ? new Date(reservation.readyAt).toLocaleDateString() : "Not ready"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {isStaff ? (
                <ActionButton onClick={() => openEdit(reservation)} variant="ghost">
                  <Edit3 size={16} /> Edit
                </ActionButton>
              ) : null}
              {["pending", "ready"].includes(reservation.status) ? (
                <ActionButton onClick={() => cancelReservation(reservation)} variant="danger">
                  <XCircle size={16} /> Cancel
                </ActionButton>
              ) : null}
              {isStaff && reservation.status === "ready" ? (
                <ActionButton onClick={() => fulfillReservation(reservation)} variant="brass">
                  <CheckCircle2 size={16} /> Fulfill
                </ActionButton>
              ) : null}
              {isStaff && ["cancelled", "fulfilled"].includes(reservation.status) ? (
                <ActionButton onClick={() => deleteReservation(reservation)} variant="danger">
                  <Trash2 size={16} /> Delete
                </ActionButton>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Drawer isOpen={drawerMode === "create"} onClose={closeDrawer} title="New reservation">
        <form className="space-y-4" onSubmit={createReservation}>
          {actionError ? <p className="border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}
          <label className="block text-sm font-bold uppercase tracking-[0.16em]">
            Unavailable book
            <select className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="book" onChange={updateField} required value={form.book}>
              <option value="">Choose book</option>
              {books.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>
          {isStaff ? (
            <label className="block text-sm font-bold uppercase tracking-[0.16em]">
              Member
              <select className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="member" onChange={updateField} required value={form.member}>
                <option value="">Choose member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <ActionButton className="w-full" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Create hold"}
          </ActionButton>
        </form>
      </Drawer>

      <Drawer isOpen={drawerMode === "edit"} onClose={closeDrawer} title="Edit reservation">
        <form className="space-y-4" onSubmit={updateReservation}>
          {actionError ? <p className="border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}
          <label className="block text-sm font-bold uppercase tracking-[0.16em]">
            Status
            <select className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="status" onChange={updateField} value={form.status}>
              <option value="pending">Pending</option>
              <option value="ready">Ready</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <ActionButton className="w-full" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save reservation"}
          </ActionButton>
        </form>
      </Drawer>
    </section>
  );
};

export default ReservationsPage;
