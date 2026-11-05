import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { buildClubThemeCss } from "./lib/clubs";
import "./index.css";

// Club palettes for both themes, keyed on html[data-club]; the boot script in index.html
// has already applied the saved club and theme.
const clubStyles = document.createElement("style");
clubStyles.textContent = buildClubThemeCss();
document.head.appendChild(clubStyles);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
