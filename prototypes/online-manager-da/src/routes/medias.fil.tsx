import { createFileRoute } from "@tanstack/react-router";
import { FeedView } from "@/components/om/career/management-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/medias/fil")({
  head: () => ({
    meta: [
      { title: "Fil du club — Online Manager" },
      {
        name: "description",
        content:
          "Fil du club : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Fil du club — Online Manager" },
      {
        property: "og:description",
        content:
          "Fil du club : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/medias/fil">
      <FeedView />
    </LoadingGate>
  );
}
