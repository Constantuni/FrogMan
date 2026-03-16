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
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-6 py-4">
          <div>
            {backTo && backLabel && (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="mb-2 text-sm font-medium text-blue-600 hover:underline"
              >
                ← {backLabel}
              </button>
            )}

            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {actions}

            <div className="hidden text-sm text-slate-600 sm:block">
              {user?.username ? `Hello, ${user.username}` : "Hello"}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
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