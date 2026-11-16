import { createFileRoute } from "@tanstack/react-router";
import { SavesView } from "@/components/om/career/start-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/carriere/sauvegardes")({
  head: () => ({
    meta: [
      { title: "Sauvegardes temporaires — Online Manager" },
      {
        name: "description",
        content:
          "Sauvegardes temporaires : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Sauvegardes temporaires — Online Manager" },
      {
        property: "og:description",
        content:
          "Sauvegardes temporaires : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/carriere/sauvegardes">
      <SavesView />
    </LoadingGate>
  );
}
