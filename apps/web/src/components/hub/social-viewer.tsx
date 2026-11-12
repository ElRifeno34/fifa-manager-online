import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useClubTheme } from "@/components/providers/hooks";
import { KeyHint } from "@/components/hub/key-hint";
import { SocialPost } from "@/components/hub/social-post";
import { useGameState } from "@/components/providers/hooks";

export function SocialViewer() {
  const navigate = useNavigate();
  const { club } = useClubTheme();
  const { season } = useGameState();
  const POSTS = season.posts;
  const [index, setIndex] = useState(0);
  const [commentsHidden, setCommentsHidden] = useState(false);
  const count = POSTS.length;

  const activeIndex = Math.min(index, Math.max(0, count - 1));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => (i + 1) % Math.max(count, 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1));
      } else if (e.key === "Escape") {
        navigate("/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, navigate]);

  const post = POSTS[activeIndex];

  if (!post) {
    return (
      <main id="contenu" className="flex h-dvh items-center justify-center p-6">
        <section className="sheet flex max-w-lg flex-col items-center gap-4 p-6 text-center">
          <h1 className="font-display text-2xl font-bold uppercase text-ink">Aucune publication</h1>
          <p className="text-sm text-ink-2">
            Le fil social sera disponible après la prochaine journée.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="caps min-h-11 rounded-md bg-club px-4 text-club-on"
          >
            Retour au hub
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      id="contenu"
      className="flex h-dvh flex-col items-center justify-center gap-3 p-6 short:p-0"
    >
      <SocialPost
        key={post.id}
        post={post}
        club={club}
        commentsHidden={commentsHidden}
        onToggleComments={() => setCommentsHidden((h) => !h)}
        controls={
          <div
            className="flex shrink-0 items-center gap-1"
            role="group"
            aria-label="Changer de publication"
          >
            <NavButton
              label="Publication précédente"
              onClick={() => setIndex((activeIndex - 1 + count) % count)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </NavButton>
            <span
              className="min-w-9 text-center font-mono text-xs font-semibold text-ink-2"
              aria-live="polite"
            >
              {activeIndex + 1} / {count}
            </span>
            <NavButton
              label="Publication suivante"
              onClick={() => setIndex((activeIndex + 1) % count)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </NavButton>
          </div>
        }
      />

      <div className="flex items-center gap-5 rounded-lg bg-overlay px-5 py-2 short:hidden">
        <KeyHint keys="← →" label="Changer de publication" />
        <KeyHint keys="Échap" label="Retour" />
      </div>
    </main>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center border border-line-strong text-ink-2 transition-colors hover:bg-raised hover:text-ink short:size-6"
    >
      {children}
    </button>
  );
}
