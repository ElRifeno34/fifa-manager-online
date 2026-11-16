import { createFileRoute } from "@tanstack/react-router";
import { DiscussionsView } from "@/components/om/career/management-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/gestion/discussions")({
  head: () => ({
    meta: [
      { title: "Discussions et promesses — Online Manager" },
      {
        name: "description",
        content:
          "Discussions et promesses : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Discussions et promesses — Online Manager" },
      {
        property: "og:description",
        content:
          "Discussions et promesses : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/gestion/discussions">
      <DiscussionsView />
    </LoadingGate>
  );
}
