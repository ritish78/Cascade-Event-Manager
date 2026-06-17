import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Layout = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        {/* Currenly I am using <a> to link elements in Navbar, we could also use NavLink from react-router-dom package. and also display if  */}
        <a href="/" className="font-bold text-lg hover:text-emerald-400">
          Cascade Event Manager
        </a>
        <div className="hidden md:flex items-center gap-4">
          <a href="/events/create" className="text-sm hover:text-emerald-400">
            + Create New Event
          </a>
          {user && (
            <>
              <a href="/events/mine" className="text-sm hover:text-emerald-400">
                My Events
              </a>
              <a href="/events/joined" className="text-sm hover:text-emerald-400">
                Joined Events
              </a>
            </>
          )}
          {user ? (
            <>
              <span className="text-emerald-600">{user.fullName},</span>
              <button onClick={logout} className="text-sm text-red-400 hover:underline cursor-pointer">
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

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-sm cursor-pointer">
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center gap-3 px-6 py-4 border-b">
          <a href="/events/create" className="text-sm hover:text-emerald-400">
            + Create New Event
          </a>
          {user && (
            <>
              <a href="/events/mine" className="text-sm hover:text-emerald-400">
                My Events
              </a>
              <a href="/events/joined" className="text-sm hover:text-emerald-400">
                Joined Events
              </a>
            </>
          )}
          {user ? (
            <>
              <span className="text-emerald-600">{user.fullName}</span>
              <button onClick={logout} className="text-sm text-red-400 hover:underline cursor-pointer">
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
      )}

      <main className="px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
