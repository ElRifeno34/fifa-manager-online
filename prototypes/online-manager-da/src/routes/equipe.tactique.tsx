import { createFileRoute } from "@tanstack/react-router";
import { TacticsView } from "@/components/om/career/team-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/equipe/tactique")({
  head: () => ({
    meta: [
      { title: "Composition et tactique — Online Manager" },
      {
        name: "description",
        content:
          "Composition et tactique : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Composition et tactique — Online Manager" },
      {
        property: "og:description",
        content:
          "Composition et tactique : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/equipe/tactique">
      <TacticsView />
    </LoadingGate>
  );
}
