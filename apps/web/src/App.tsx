import { Route, Routes, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppBackground } from "@/components/hub/app-background";
import { HomeHub } from "@/components/hub/home-hub";
import { MailView } from "@/components/hub/mail-view";
import { RotateOverlay } from "@/components/hub/rotate-overlay";
import { SocialViewer } from "@/components/hub/social-viewer";
import { ClubThemeProvider } from "@/components/providers/club-theme";
import { GameStateProvider } from "@/components/providers/game-state";
import { ToastProvider } from "@/components/providers/toast";

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <ClubThemeProvider>
        <GameStateProvider>
          <ToastProvider>
            <a href="#contenu" className="skip-link caps">
              Aller au contenu
            </a>
            <AppBackground />
            {/* A crash in one screen stays in that screen; changing route gives it a fresh try. */}
            <ErrorBoundary key={location.pathname}>
              <Routes>
                <Route path="/" element={<HomeHub />} />
                <Route path="/messagerie" element={<MailView />} />
                <Route path="/medias/fil" element={<SocialViewer />} />
                <Route path="*" element={<HomeHub />} />
              </Routes>
            </ErrorBoundary>
            <RotateOverlay />
          </ToastProvider>
        </GameStateProvider>
      </ClubThemeProvider>
    </ErrorBoundary>
  );
}
