import { createBrowserRouter } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Login from "../pages/login/Login";
import Layout from "../components/layout/Layout";
import Register from "../pages/register/Register";
import EventDetailPage from "../pages/events/EventDetailPage";
import EventsPage from "../pages/events/EventsPage";
import ProtectedRoute from "./ProtectedRoute";
import { CreateEventPage } from "../pages/events/CreateEventPage";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <EventsPage /> },
      { path: "/events/:id", element: <EventDetailPage /> },
      { element: <ProtectedRoute />, children: [{ path: "/events/create", element: <CreateEventPage /> }] },
    ],
  },
]);
