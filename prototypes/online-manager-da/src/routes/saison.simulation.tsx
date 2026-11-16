import { createFileRoute } from "@tanstack/react-router";
import { SimulationView } from "@/components/om/career/season-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/saison/simulation")({
  head: () => ({
    meta: [
      { title: "Simulation rapide — Online Manager" },
      {
        name: "description",
        content:
          "Simulation rapide : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Simulation rapide — Online Manager" },
      {
        property: "og:description",
        content:
          "Simulation rapide : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/saison/simulation">
      <SimulationView />
    </LoadingGate>
  );
}
