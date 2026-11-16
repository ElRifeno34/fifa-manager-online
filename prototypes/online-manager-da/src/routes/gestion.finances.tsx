import { createFileRoute } from "@tanstack/react-router";
import { FinancesView } from "@/components/om/career/management-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/gestion/finances")({
  head: () => ({
    meta: [
      { title: "Finances — Online Manager" },
      {
        name: "description",
        content:
          "Finances : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Finances — Online Manager" },
      {
        property: "og:description",
        content:
          "Finances : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <LoadingGate id="/gestion/finances">
      <FinancesView />
    </LoadingGate>
  );
}
