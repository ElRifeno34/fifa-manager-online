import { createFileRoute } from "@tanstack/react-router";
import { LiveMatchView } from "@/components/om/career/match-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/match/direct")({
  head: () => ({
    meta: [
      { title: "Match texte — Online Manager" },
      {
        name: "description",
        content:
          "Match texte : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Match texte — Online Manager" },
      {
        property: "og:description",
        content:
          "Match texte : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/match/direct">
      <LiveMatchView />
    </LoadingGate>
  );
}
