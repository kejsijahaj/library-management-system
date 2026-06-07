import { BookOpen, CalendarClock, LayoutDashboard, Library, LogOut, UserRound, Users } from "lucide-react";
import { useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Books", href: "/books", icon: BookOpen },
  { label: "My Library", href: "/my-library", icon: UserRound, roles: ["member"] },
  { label: "Loans", href: "/loans", icon: Library, roles: ["admin", "librarian"] },
  { label: "Reservations", href: "/reservations", icon: CalendarClock },
  { label: "Users", href: "/users", icon: Users, roles: ["admin"] }
];

const AppShell = () => {
  const { logout, user } = useAuth();
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => !item.roles || item.roles.includes(user?.role)),
    [user?.role]
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed bottom-0 left-0 right-0 z-20 border-t-2 border-ink bg-ink text-paper md:bottom-auto md:right-auto md:h-screen md:w-24 md:border-r-2 md:border-t-0">
        <nav className="flex h-16 items-center justify-around md:h-full md:flex-col md:justify-start md:gap-4 md:py-8">
          <div className="hidden h-12 w-12 rotate-[-8deg] items-center justify-center bg-chartreuse font-display text-xl font-bold text-ink shadow-hard md:flex">
            L
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                aria-label={item.label}
                className={({ isActive }) =>
                  [
                    "group flex h-12 w-12 items-center justify-center border-2 border-transparent transition duration-200 hover:-translate-y-1 hover:border-chartreuse hover:text-chartreuse md:hover:translate-x-1 md:hover:translate-y-0",
                    isActive ? "bg-chartreuse text-ink" : "text-paper"
                  ].join(" ")
                }
                key={item.href}
                title={item.label}
                to={item.href}
              >
                <Icon size={21} />
              </NavLink>
            );
          })}
          <button
            aria-label="Log out"
            className="flex h-12 w-12 items-center justify-center text-paper transition duration-200 hover:-translate-y-1 hover:text-chartreuse md:mt-auto md:hover:translate-x-1 md:hover:translate-y-0"
            onClick={logout}
            title="Log out"
            type="button"
          >
            <LogOut size={21} />
          </button>
        </nav>
      </aside>

      <main className="min-h-screen pb-24 md:ml-24 md:pb-0">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 md:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-mineral">The Kejsi Library System</p>
            <h1 className="font-display text-3xl font-bold md:text-5xl">Circulation desk</h1>
          </div>
          <div className="border-2 border-ink bg-parchment px-4 py-2 text-right shadow-hard">
            <p className="text-sm font-bold">{user?.name || "Demo User"}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-mineral">{user?.role || "member"}</p>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
