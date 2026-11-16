import { createFileRoute } from "@tanstack/react-router";
import { StandingsView } from "@/components/om/career/season-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/saison/classement")({
  head: () => ({
    meta: [
      { title: "Classement — Online Manager" },
      {
        name: "description",
        content:
          "Classement : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Classement — Online Manager" },
      {
        property: "og:description",
        content:
          "Classement : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/saison/classement">
      <StandingsView />
    </LoadingGate>
  );
}
