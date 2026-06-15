import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div>
        <p>Loading! Please wait a moment!</p>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
