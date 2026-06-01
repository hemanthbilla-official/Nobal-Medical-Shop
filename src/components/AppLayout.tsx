import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { logout } from "../firebase/auth";

const workerNav = [
  { to: "/worker", label: "Sales" },
  { to: "/worker/photos", label: "Photos" },
];

const ownerNav = [
  { to: "/owner", label: "Dashboard" },
  { to: "/owner/entries", label: "Entries" },
  { to: "/owner/analytics", label: "Analytics" },
  { to: "/owner/photos", label: "Photos" },
  { to: "/owner/audit", label: "Audit" },
];

export function AppLayout() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const nav = role === "owner" ? ownerNav : workerNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-3 sm:px-4 h-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-semibold text-sm sm:text-base text-stone-800">MedShop</span>
          <span className="text-[10px] uppercase tracking-wider text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
            {role}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-stone-400 hidden sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="hidden sm:flex flex-col w-36 lg:w-40 bg-white border-r border-stone-200 p-2 gap-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/worker" || item.to === "/owner"}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-stone-100 text-stone-900 font-medium"
                    : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-20 sm:pb-6 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex z-40">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/worker" || item.to === "/owner"}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm transition-colors font-medium ${
                isActive
                  ? "text-stone-900 bg-stone-50"
                  : "text-stone-400"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
