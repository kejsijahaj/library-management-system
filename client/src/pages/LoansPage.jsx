import { CheckCircle2, Edit3, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { api, getApiError } from "../api/client.js";
import ActionButton from "../components/ActionButton.jsx";
import Drawer from "../components/Drawer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useApiQuery } from "../hooks/useApiQuery.js";

const blankLoan = {
  book: "",
  member: ""
};

const dateOnly = (date) => (date ? new Date(date).toISOString().slice(0, 10) : "");

const LoansPage = () => {
  const [status, setStatus] = useState("");
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [form, setForm] = useState(blankLoan);
  const [editForm, setEditForm] = useState({ dueAt: "", fineAtReturn: "0" });
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, refetch } = useApiQuery(async () => {
    const [loanResponse, bookResponse, memberResponse] = await Promise.all([
      api.get("/loans", { params: { status } }),
      api.get("/books", { params: { availability: "available", status: "active" } }),
      api.get("/users/members")
    ]);

    return {
      books: bookResponse.data.books,
      loans: loanResponse.data.loans,
      members: memberResponse.data.members
    };
  }, [status]);

  const loans = data?.loans || [];
  const books = data?.books || [];
  const members = data?.members || [];
  const overdueCount = useMemo(() => loans.filter((loan) => loan.isOverdue).length, [loans]);

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const updateEditField = useCallback((event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }, []);

  const openCreate = () => {
    setActionError("");
    setSelectedLoan(null);
    setForm(blankLoan);
    setDrawerMode("create");
  };

  const openEdit = (loan) => {
    setActionError("");
    setSelectedLoan(loan);
    setEditForm({ dueAt: dateOnly(loan.dueAt), fineAtReturn: String(loan.fineAtReturn || 0) });
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setActionError("");
    setSelectedLoan(null);
    setDrawerMode(null);
  };

  const createLoan = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");

    try {
      await api.post("/loans", form);
      closeDrawer();
      await refetch();
    } catch (createError) {
      setActionError(getApiError(createError));
    } finally {
      setIsSaving(false);
    }
  };

  const updateLoan = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");

    try {
      await api.patch(`/loans/${selectedLoan._id}`, {
        dueAt: editForm.dueAt,
        fineAtReturn: Number(editForm.fineAtReturn || 0)
      });
      closeDrawer();
      await refetch();
    } catch (updateError) {
      setActionError(getApiError(updateError));
    } finally {
      setIsSaving(false);
    }
  };

  const returnLoan = async (loan) => {
    setActionError("");

    try {
      await api.patch(`/loans/${loan._id}/return`);
      await refetch();
    } catch (returnError) {
      setActionError(getApiError(returnError));
    }
  };

  const deleteLoan = async (loan) => {
    setActionError("");

    try {
      await api.delete(`/loans/${loan._id}`);
      await refetch();
    } catch (deleteError) {
      setActionError(getApiError(deleteError));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="border-l-2 border-ink pl-6">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blueprint">Circulation</p>
          <h2 className="mt-3 font-display text-5xl font-bold">Loans and returns</h2>
          <p className="mt-4 text-lg text-ink/75">Issue books, adjust due dates, return copies, and watch overdue fines.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["active", "Active"],
            ["overdue", "Overdue"],
            ["returned", "Returned"]
          ].map(([value, label]) => (
            <button
              className="border-2 border-ink bg-parchment p-5 text-left transition hover:-translate-y-1 hover:bg-chartreuse"
              key={value}
              onClick={() => setStatus(status === value ? "" : value)}
              type="button"
            >
              <p className="font-display text-4xl font-bold">{value === "overdue" ? overdueCount : loans.filter((loan) => loan.status === value).length}</p>
              <p className="text-sm font-bold uppercase tracking-[0.18em]">{label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <select className="min-h-12 border-2 border-ink bg-parchment px-4 font-bold" onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="">All loans</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="returned">Returned</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <ActionButton onClick={openCreate} variant="brass">
          <Plus size={18} /> New loan
        </ActionButton>
      </div>
      {actionError ? <p className="mt-4 border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}

      <div className="mt-6 overflow-hidden border-2 border-ink">
        {isLoading ? <p className="bg-parchment p-6 font-bold">Loading loans...</p> : null}
        {error ? <EmptyState message={error} title="Loans could not load" /> : null}
        {!isLoading && !loans.length ? <EmptyState message="No titles are currently checked out in this view." title="No loans found" /> : null}
        {loans.map((loan) => (
          <div className="grid gap-4 border-b-2 border-ink bg-paper p-4 transition hover:bg-parchment md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" key={loan._id}>
            <div>
              <h3 className="font-display text-2xl font-bold">{loan.book?.title}</h3>
              <p className="text-sm text-ink/70">{loan.book?.author}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-mineral">{loan.member?.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Due</p>
              <p className="font-bold">{dateOnly(loan.dueAt)}</p>
              {loan.isOverdue ? <StatusPill status="overdue" /> : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Fine</p>
              <p className="font-display text-3xl font-bold">${Number(loan.computedFine || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Status</p>
              <StatusPill status={loan.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <ActionButton onClick={() => openEdit(loan)} variant="ghost">
                <Edit3 size={16} /> Edit
              </ActionButton>
              {loan.status === "active" ? (
                <ActionButton onClick={() => returnLoan(loan)} variant="brass">
                  <CheckCircle2 size={16} /> Return
                </ActionButton>
              ) : (
                <ActionButton onClick={() => deleteLoan(loan)} variant="danger">
                  <Trash2 size={16} /> Delete
                </ActionButton>
              )}
            </div>
          </div>
        ))}
      </div>

      <Drawer isOpen={drawerMode === "create"} onClose={closeDrawer} title="Issue loan">
        <form className="space-y-4" onSubmit={createLoan}>
          {actionError ? <p className="border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}
          <label className="block text-sm font-bold uppercase tracking-[0.16em]">
            Book
            <select className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="book" onChange={updateField} required value={form.book}>
              <option value="">Choose available book</option>
              {books.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title} ({book.availableCopies} available)
                </option>
              ))}
            </select>
          </label>
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
          <ActionButton className="w-full" disabled={isSaving} type="submit">
            {isSaving ? "Issuing..." : "Issue loan"}
          </ActionButton>
        </form>
      </Drawer>

      <Drawer isOpen={drawerMode === "edit"} onClose={closeDrawer} title="Edit loan">
        <form className="space-y-4" onSubmit={updateLoan}>
          {actionError ? <p className="border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}
          <label className="block text-sm font-bold uppercase tracking-[0.16em]">
            Due date
            <input className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="dueAt" onChange={updateEditField} required type="date" value={editForm.dueAt} />
          </label>
          <label className="block text-sm font-bold uppercase tracking-[0.16em]">
            Fine at return
            <input className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="fineAtReturn" onChange={updateEditField} step="0.01" type="number" value={editForm.fineAtReturn} />
          </label>
          <ActionButton className="w-full" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save loan"}
          </ActionButton>
        </form>
      </Drawer>
    </section>
  );
};

export default LoansPage;
