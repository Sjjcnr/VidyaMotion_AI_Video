import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { loadProjectFonts } from "./remotion/fonts";

void loadProjectFonts().catch((err) => {
  console.error("Failed to preload offline fonts:", err);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
