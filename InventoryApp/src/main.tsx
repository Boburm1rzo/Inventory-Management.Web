import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import CSS variables and global styles
import "./styles/global.css";

// Initialize i18n
import "./i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
