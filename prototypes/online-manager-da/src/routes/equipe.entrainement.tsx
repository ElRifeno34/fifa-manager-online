import { createFileRoute } from "@tanstack/react-router";
import { TrainingView } from "@/components/om/career/team-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/equipe/entrainement")({
  head: () => ({
    meta: [
      { title: "Entraînement — Online Manager" },
      {
        name: "description",
        content:
          "Entraînement : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Entraînement — Online Manager" },
      {
        property: "og:description",
        content:
          "Entraînement : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/equipe/entrainement">
      <TrainingView />
    </LoadingGate>
  );
}
