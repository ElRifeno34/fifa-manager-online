import { IMAGES } from "@/data/mock";
import { createFileRoute } from "@tanstack/react-router";
import { HubView } from "@/components/om/career/start-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Hub du manager — Online Manager" },
      {
        name: "description",
        content:
          "Hub du manager : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Hub du manager — Online Manager" },
      {
        property: "og:description",
        content:
          "Hub du manager : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: IMAGES.press },
      { name: "twitter:image", content: IMAGES.press },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/hub">
      <HubView />
    </LoadingGate>
  );
}
