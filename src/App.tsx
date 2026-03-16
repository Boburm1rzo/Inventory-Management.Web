import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./components/common/LoadingSpinner";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Helper component to delay rendering until initial auth check is done
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use the properly typed custom hook instead of require()
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  return <>{children}</>;
};

export default App;
