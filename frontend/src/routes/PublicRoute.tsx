import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  console.log("Public route:", { user, isLoading });

  if (isLoading)
    return (
      <div>
        <p>Loading! Please wait a moment!</p>
      </div>
    );

  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PublicRoute;
