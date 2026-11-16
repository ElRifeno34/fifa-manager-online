import { createFileRoute } from "@tanstack/react-router";
import { MenuView } from "@/components/om/career/start-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Menu de carrière — Online Manager" },
      {
        name: "description",
        content:
          "Menu de carrière : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Menu de carrière — Online Manager" },
      {
        property: "og:description",
        content:
          "Menu de carrière : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/">
      <MenuView />
    </LoadingGate>
  );
}
