import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import NotFound from "./components/NotFound";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="*"
          element={
            <NotFound onNavigate={(page) => (window.location.href = page)} />
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
