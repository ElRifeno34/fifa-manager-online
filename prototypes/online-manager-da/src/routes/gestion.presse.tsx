import { IMAGES } from "@/data/mock";
import { createFileRoute } from "@tanstack/react-router";
import { PressView } from "@/components/om/career/management-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/gestion/presse")({
  head: () => ({
    meta: [
      { title: "Presse — Online Manager" },
      {
        name: "description",
        content:
          "Presse : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Presse — Online Manager" },
      {
        property: "og:description",
        content:
          "Presse : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
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
    <LoadingGate id="/gestion/presse">
      <PressView />
    </LoadingGate>
  );
}
