import { createFileRoute } from "@tanstack/react-router";
import { NewCareerView } from "@/components/om/career/start-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/carriere/nouvelle")({
  head: () => ({
    meta: [
      { title: "Nouvelle carrière — Online Manager" },
      {
        name: "description",
        content:
          "Nouvelle carrière : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Nouvelle carrière — Online Manager" },
      {
        property: "og:description",
        content:
          "Nouvelle carrière : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/carriere/nouvelle">
      <NewCareerView />
    </LoadingGate>
  );
}
