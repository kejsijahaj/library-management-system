import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { api, getApiError } from "../api/client.js";
import ActionButton from "../components/ActionButton.jsx";
import Drawer from "../components/Drawer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApiQuery } from "../hooks/useApiQuery.js";

const blankBook = {
  author: "",
  availableCopies: "",
  categories: "",
  description: "",
  isbn: "",
  publishedYear: "",
  shelfLocation: "",
  title: "",
  totalCopies: "1"
};

const toBookForm = (book) => ({
  author: book.author || "",
  availableCopies: String(book.availableCopies ?? ""),
  categories: book.categories?.join(", ") || "",
  description: book.description || "",
  isbn: book.isbn || "",
  publishedYear: String(book.publishedYear || ""),
  shelfLocation: book.shelfLocation || "",
  title: book.title || "",
  totalCopies: String(book.totalCopies ?? 1)
});

const toPayload = (form) => ({
  ...form,
  availableCopies: form.availableCopies === "" ? undefined : Number(form.availableCopies),
  publishedYear: form.publishedYear === "" ? undefined : Number(form.publishedYear),
  totalCopies: Number(form.totalCopies || 1)
});

const BooksPage = () => {
  const { user } = useAuth();
  const isStaff = ["admin", "librarian"].includes(user?.role);
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("");
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [form, setForm] = useState(blankBook);
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, refetch } = useApiQuery(async () => {
    const response = await api.get("/books", { params: { availability, query, status: "active" } });
    return response.data.books;
  }, [availability, query]);

  const books = data || [];
  const featuredBook = useMemo(() => books[0], [books]);

  const openCreate = () => {
    setActionError("");
    setSelectedBook(null);
    setForm(blankBook);
    setDrawerMode("create");
  };

  const openEdit = (book) => {
    setActionError("");
    setSelectedBook(book);
    setForm(toBookForm(book));
    setDrawerMode("edit");
  };

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedBook(null);
    setActionError("");
  };

  const saveBook = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");

    try {
      if (drawerMode === "edit") {
        await api.patch(`/books/${selectedBook._id}`, toPayload(form));
      } else {
        await api.post("/books", toPayload(form));
      }

      closeDrawer();
      await refetch();
    } catch (saveError) {
      setActionError(getApiError(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const archiveBook = async (book) => {
    setActionError("");

    try {
      await api.delete(`/books/${book._id}`);
      await refetch();
    } catch (archiveError) {
      setActionError(getApiError(archiveError));
    }
  };

  const reserveBook = async (book) => {
    setActionError("");

    try {
      await api.post("/reservations", { book: book._id });
      await refetch();
    } catch (reserveError) {
      setActionError(getApiError(reserveError));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border-y-2 border-ink py-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cinnabar">Catalog</p>
          <h2 className="mt-3 font-display text-5xl font-bold">Book spine index</h2>
          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 border-2 border-ink bg-paper px-4">
              <Search size={18} />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, author, ISBN, category"
                value={query}
              />
            </label>
            <select className="min-h-12 border-2 border-ink bg-parchment px-4 font-bold" onChange={(event) => setAvailability(event.target.value)} value={availability}>
              <option value="">All copies</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            {isStaff ? (
              <ActionButton onClick={openCreate} variant="brass">
                <Plus size={18} /> Add book
              </ActionButton>
            ) : null}
          </div>
          {actionError ? <p className="mt-4 border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}
        </div>

        <div className="min-h-48 -rotate-2 border-2 border-ink bg-chartreuse p-6 shadow-hard transition duration-300 hover:rotate-0">
          <p className="text-sm font-bold uppercase tracking-[0.24em]">Featured shelf</p>
          <p className="mt-4 font-display text-3xl font-bold">{featuredBook?.title || "No books loaded"}</p>
          <p className="mt-2 text-sm text-ink/70">{featuredBook?.author || "Seed the database to fill this shelf."}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden border-2 border-ink">
        {isLoading ? <p className="bg-parchment p-6 font-bold">Loading catalog...</p> : null}
        {error ? <EmptyState message={error} title="Catalog could not load" /> : null}
        {!isLoading && !books.length ? <EmptyState message="Try changing the filters or add a new book." title="No books found" /> : null}
        {books.map((book, index) => (
          <div className="grid gap-4 border-b-2 border-ink bg-paper p-4 transition hover:bg-parchment md:grid-cols-[3rem_1.4fr_1fr_1fr_auto]" key={book._id}>
            <div className="flex h-full min-h-16 items-center justify-center bg-ink font-display text-xl font-bold text-paper">{String(index + 1).padStart(2, "0")}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl font-bold">{book.title}</h3>
                <StatusPill status={book.status} />
              </div>
              <p className="text-sm text-ink/70">{book.author}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-mineral">{book.categories?.join(" / ") || "Uncategorized"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Location</p>
              <p className="font-bold">{book.shelfLocation}</p>
              <p className="text-sm text-ink/60">{book.isbn || "No ISBN"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Copies</p>
              <p className="font-display text-3xl font-bold">
                {book.availableCopies}/{book.totalCopies}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {isStaff ? (
                <>
                  <ActionButton onClick={() => openEdit(book)} variant="ghost">
                    <Edit3 size={16} /> Edit
                  </ActionButton>
                  <ActionButton onClick={() => archiveBook(book)} variant="danger">
                    <Trash2 size={16} /> Archive
                  </ActionButton>
                </>
              ) : book.availableCopies === 0 ? (
                <ActionButton onClick={() => reserveBook(book)} variant="brass">
                  Reserve
                </ActionButton>
              ) : (
                <span className="font-bold text-mineral">Available</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Drawer isOpen={Boolean(drawerMode)} onClose={closeDrawer} title={drawerMode === "edit" ? "Edit book" : "Add book"}>
        <form className="space-y-4" onSubmit={saveBook}>
          {actionError ? <p className="border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}
          {[
            ["title", "Title"],
            ["author", "Author"],
            ["isbn", "ISBN"],
            ["categories", "Categories"],
            ["shelfLocation", "Shelf location"],
            ["publishedYear", "Published year"],
            ["totalCopies", "Total copies"],
            ["availableCopies", "Available copies"]
          ].map(([name, label]) => (
            <label className="block text-sm font-bold uppercase tracking-[0.16em]" key={name}>
              {label}
              <input
                className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse"
                name={name}
                onChange={updateField}
                required={["title", "author", "totalCopies"].includes(name)}
                type={["publishedYear", "totalCopies", "availableCopies"].includes(name) ? "number" : "text"}
                value={form[name]}
              />
            </label>
          ))}
          <label className="block text-sm font-bold uppercase tracking-[0.16em]">
            Description
            <textarea
              className="mt-2 min-h-28 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse"
              name="description"
              onChange={updateField}
              value={form.description}
            />
          </label>
          <ActionButton className="w-full" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save book"}
          </ActionButton>
        </form>
      </Drawer>
    </section>
  );
};

export default BooksPage;
