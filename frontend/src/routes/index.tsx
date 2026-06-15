import { createBrowserRouter } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Login from "../pages/login/Login";
import Layout from "../components/layout/Layout";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <Login /> }],
  },
  {
    element: <Layout />,
    children: [],
  },
]);
