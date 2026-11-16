import { createFileRoute } from "@tanstack/react-router";
import { SummaryView } from "@/components/om/career/match-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/match/resume")({
  head: () => ({
    meta: [
      { title: "Résumé du match — Online Manager" },
      {
        name: "description",
        content:
          "Résumé du match : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Résumé du match — Online Manager" },
      {
        property: "og:description",
        content:
          "Résumé du match : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/match/resume">
      <SummaryView />
    </LoadingGate>
  );
}
