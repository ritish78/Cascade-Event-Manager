import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <a href="/" className="font-bold text-lg hover:text-emerald-400">
          Cascade Event Manager
        </a>
        <div className="flex gap-4">
          {user ? (
            <>
              <span className="text-emerald-600">{user.full_name},</span>
              <button onClick={logout} className="text-sm text-red-400 hover:underline">
                Logout!
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm hover:text-emerald-400">
                Login
              </a>
              <a href="/register" className="text-sm hover:text-emerald-400">
                Register
              </a>
            </>
          )}
        </div>
      </nav>
      <main className="px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
