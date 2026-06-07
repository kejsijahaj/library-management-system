import { Edit3, Plus, Search, UserX } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { api, getApiError } from "../api/client.js";
import ActionButton from "../components/ActionButton.jsx";
import Drawer from "../components/Drawer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useApiQuery } from "../hooks/useApiQuery.js";

const blankUser = {
  email: "",
  name: "",
  password: "",
  phone: "",
  role: "member",
  status: "active"
};

const toUserForm = (user) => ({
  email: user.email || "",
  name: user.name || "",
  password: "",
  phone: user.phone || "",
  role: user.role || "member",
  status: user.status || "active"
});

const UsersPage = () => {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(blankUser);
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, refetch } = useApiQuery(async () => {
    const response = await api.get("/users", { params: { query, role } });
    return response.data.users;
  }, [query, role]);

  const users = data || [];
  const counts = useMemo(
    () =>
      users.reduce(
        (total, user) => {
          total[user.role] = (total[user.role] || 0) + 1;
          return total;
        },
        { admin: 0, librarian: 0, member: 0 }
      ),
    [users]
  );

  const updateField = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const openCreate = () => {
    setActionError("");
    setSelectedUser(null);
    setForm(blankUser);
    setDrawerMode("create");
  };

  const openEdit = (user) => {
    setActionError("");
    setSelectedUser(user);
    setForm(toUserForm(user));
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setActionError("");
    setSelectedUser(null);
    setDrawerMode(null);
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setActionError("");

    const payload = { ...form };
    if (!payload.password) delete payload.password;

    try {
      if (drawerMode === "edit") {
        await api.patch(`/users/${selectedUser._id}`, payload);
      } else {
        await api.post("/users", payload);
      }

      closeDrawer();
      await refetch();
    } catch (saveError) {
      setActionError(getApiError(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const deactivateUser = async (user) => {
    setActionError("");

    try {
      await api.delete(`/users/${user._id}`);
      await refetch();
    } catch (deleteError) {
      setActionError(getApiError(deleteError));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="border-y-2 border-ink py-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-mineral">Admin desk</p>
          <h2 className="mt-3 font-display text-5xl font-bold">User management</h2>
          <p className="mt-4 text-lg text-ink/75">Staff, member records, and account standing in one place.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["admin", "librarian", "member"].map((item) => (
            <button
              className="border-2 border-ink bg-parchment p-5 text-left transition hover:-translate-y-1 hover:bg-chartreuse"
              key={item}
              onClick={() => setRole(role === item ? "" : item)}
              type="button"
            >
              <p className="font-display text-4xl font-bold">{counts[item]}</p>
              <p className="text-sm font-bold uppercase tracking-[0.18em]">{item}s</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <label className="flex min-h-12 flex-1 items-center gap-3 border-2 border-ink bg-paper px-4">
          <Search size={18} />
          <input className="w-full bg-transparent outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search users" value={query} />
        </label>
        <select className="min-h-12 border-2 border-ink bg-parchment px-4 font-bold" onChange={(event) => setRole(event.target.value)} value={role}>
          <option value="">All roles</option>
          <option value="admin">Admins</option>
          <option value="librarian">Librarians</option>
          <option value="member">Members</option>
        </select>
        <ActionButton onClick={openCreate} variant="brass">
          <Plus size={18} /> Add user
        </ActionButton>
      </div>
      {actionError ? <p className="mt-4 border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}

      <div className="mt-6 overflow-hidden border-2 border-ink">
        {isLoading ? <p className="bg-parchment p-6 font-bold">Loading users...</p> : null}
        {error ? <EmptyState message={error} title="Users could not load" /> : null}
        {!isLoading && !users.length ? <EmptyState message="No accounts match the current view." title="No users found" /> : null}
        {users.map((user) => (
          <div className="grid gap-4 border-b-2 border-ink bg-paper p-4 transition hover:bg-parchment md:grid-cols-[1.2fr_1fr_1fr_auto]" key={user._id}>
            <div>
              <h3 className="font-display text-2xl font-bold">{user.name}</h3>
              <p className="text-sm text-ink/70">{user.email}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-mineral">{user.membershipCode || "staff account"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Role</p>
              <p className="font-bold capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Status</p>
              <StatusPill status={user.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <ActionButton onClick={() => openEdit(user)} variant="ghost">
                <Edit3 size={16} /> Edit
              </ActionButton>
              <ActionButton onClick={() => deactivateUser(user)} variant="danger">
                <UserX size={16} /> Deactivate
              </ActionButton>
            </div>
          </div>
        ))}
      </div>

      <Drawer isOpen={Boolean(drawerMode)} onClose={closeDrawer} title={drawerMode === "edit" ? "Edit user" : "Add user"}>
        <form className="space-y-4" onSubmit={saveUser}>
          {actionError ? <p className="border-2 border-cinnabar bg-paper px-4 py-3 text-sm font-bold text-cinnabar">{actionError}</p> : null}
          {[
            ["name", "Name", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "text"],
            ["password", drawerMode === "edit" ? "New password optional" : "Password", "password"]
          ].map(([name, label, type]) => (
            <label className="block text-sm font-bold uppercase tracking-[0.16em]" key={name}>
              {label}
              <input
                className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse"
                name={name}
                onChange={updateField}
                required={drawerMode === "create" && ["name", "email", "password"].includes(name)}
                type={type}
                value={form[name]}
              />
            </label>
          ))}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold uppercase tracking-[0.16em]">
              Role
              <select className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="role" onChange={updateField} value={form.role}>
                <option value="member">Member</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="block text-sm font-bold uppercase tracking-[0.16em]">
              Status
              <select className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none transition focus:bg-chartreuse" name="status" onChange={updateField} value={form.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <ActionButton className="w-full" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save user"}
          </ActionButton>
        </form>
      </Drawer>
    </section>
  );
};

export default UsersPage;
