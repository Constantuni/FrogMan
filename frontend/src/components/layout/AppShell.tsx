import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface AppShellProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const AppShell = ({
  title,
  subtitle,
  backTo,
  backLabel,
  actions,
  children,
}: AppShellProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-6 px-6 py-4">
          
          {/* TITLE & HEADER COLUMN: Constrained to prevent horizontal layout blowout */}
          <div className="min-w-0 flex-1">
            {backTo && backLabel && (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="mb-2 text-sm font-medium text-blue-600 hover:underline inline-flex items-center"
              >
                ← {backLabel}
              </button>
            )}

            {/* Added break-words to handle continuous strings and line-clamp-2 to restrict massive blocks */}
            <h1 className="text-2xl font-bold text-slate-900 break-words line-clamp-2 pr-2">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-600 break-words line-clamp-2 pr-2">
                {subtitle}
              </p>
            )}
          </div>

          {/* ACTIONS & USER BAR COLUMN: Prevented from shrinking when title pushes against it */}
          <div className="flex shrink-0 items-center gap-4 pt-1">
            {actions}

            <div className="hidden text-sm text-slate-600 sm:block max-w-[150px] truncate">
              {user?.username ? `Hello, ${user.username}` : "Hello"}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
};

export default AppShell;