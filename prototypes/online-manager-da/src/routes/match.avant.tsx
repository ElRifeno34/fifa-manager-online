import { createFileRoute } from "@tanstack/react-router";
import { BeforeMatchView } from "@/components/om/career/match-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/match/avant")({
  head: () => ({
    meta: [
      { title: "Avant-match — Online Manager" },
      {
        name: "description",
        content:
          "Avant-match : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Avant-match — Online Manager" },
      {
        property: "og:description",
        content:
          "Avant-match : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/match/avant">
      <BeforeMatchView />
    </LoadingGate>
  );
}
