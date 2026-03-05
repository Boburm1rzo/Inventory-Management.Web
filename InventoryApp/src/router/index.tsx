import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layouts/AppLatout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import InventoriesPage from "../pages/InventoriesPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";

export const router = createBrowserRouter([
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "inventories",
        element: <InventoriesPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
