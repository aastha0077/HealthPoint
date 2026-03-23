import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./contexts/AuthProvider.tsx";

import { NotificationProvider } from "./contexts/NotificationContext.tsx";
import { FavoriteProvider } from "./contexts/FavoriteContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <FavoriteProvider>
            <App />
          </FavoriteProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
