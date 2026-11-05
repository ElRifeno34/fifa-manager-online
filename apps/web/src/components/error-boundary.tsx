import { Component, type ErrorInfo, type ReactNode } from "react";
import { BG_STORAGE_KEY, CLUB_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/clubs";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Catches render errors so a bug shows a way out instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Online Manager a rencontré une erreur :", error, info.componentStack);
  }

  private resetSettings = () => {
    // A corrupt saved preference is the most likely cause of a crash at startup.
    try {
      for (const key of [CLUB_STORAGE_KEY, THEME_STORAGE_KEY, BG_STORAGE_KEY])
        localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable (private mode); reloading is still worth it.
    }
    window.location.assign("/");
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main id="contenu" role="alert" className="flex h-dvh items-center justify-center p-6">
        <div className="sheet layer flex w-full max-w-[28rem] flex-col gap-4 p-6">
          <p className="caps text-club-ink">Erreur</p>
          <h1 className="font-display text-3xl font-bold uppercase leading-none text-ink">
            Un problème est survenu
          </h1>
          <p className="text-sm text-ink-2">
            Cet écran n'a pas pu s'afficher. Vos réglages sont conservés : vous pouvez réessayer ou
            revenir au hub.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="caps h-10 rounded-md bg-club px-4 text-club-on"
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="caps h-10 rounded-md border border-line-strong px-4 text-ink hover:bg-raised"
            >
              Revenir au hub
            </button>
            <button
              type="button"
              onClick={this.resetSettings}
              className="caps h-10 rounded-md px-4 text-ink-2 underline-offset-4 hover:underline"
            >
              Réinitialiser les réglages
            </button>
          </div>
        </div>
      </main>
    );
  }
}
