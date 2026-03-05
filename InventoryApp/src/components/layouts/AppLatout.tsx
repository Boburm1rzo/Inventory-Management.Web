import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const AppLayout: React.FC = () => {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .app-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
