import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <a href="/" className="font-bold text-lg">
          Cascade Event Manager
        </a>
        <div className="flex gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.fullName}</span>
              <button onClick={logout} className="text-sm text-red-500 hover:underline">
                Logout!
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm hover:underline">
                Login
              </a>
              <a href="/register" className="text-sm hover:underline">
                Register
              </a>
            </>
          )}
        </div>
      </nav>
      <main className="px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
