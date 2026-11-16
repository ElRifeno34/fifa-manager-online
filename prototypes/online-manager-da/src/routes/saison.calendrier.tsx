import { createFileRoute } from "@tanstack/react-router";
import { CalendarView } from "@/components/om/career/season-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/saison/calendrier")({
  head: () => ({
    meta: [
      { title: "Calendrier 2026–27 — Online Manager" },
      {
        name: "description",
        content:
          "Calendrier 2026–27 : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Calendrier 2026–27 — Online Manager" },
      {
        property: "og:description",
        content:
          "Calendrier 2026–27 : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/saison/calendrier">
      <CalendarView />
    </LoadingGate>
  );
}
