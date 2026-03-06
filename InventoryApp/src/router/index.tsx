import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layouts/AppLatout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import InventoriesPage from "../pages/InventoriesPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import InventoryDetailPage from "../pages/InventoriesPage"; // ADD THIS IMPORT

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
      // ADD THIS NEW ROUTE HERE:
      {
        path: "inventories/:id",
        element: <InventoryDetailPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
