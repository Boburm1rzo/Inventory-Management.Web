import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import "../../styles/AppLayout.css";

const AppLayout: React.FC = () => {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
