import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layouts/AppLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import InventoriesPage from "../pages/InventoriesPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import InventoryPage from "../pages/InventoryPage";
import ItemPage from "../pages/ItemPage";
import SearchPage from "../pages/SearchPage";
import AdminPage from "../pages/AdminPage";
import PersonalPage from "../pages/PersonalPage";

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
        path: "inventories/:id",
        element: <InventoryPage />,
      },
      {
        path: "inventories/:inventoryId/items/:itemId",
        element: <ItemPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
      {
        path: "me",
        element: <PersonalPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
