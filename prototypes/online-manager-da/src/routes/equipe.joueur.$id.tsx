import { createFileRoute } from "@tanstack/react-router";
import { PlayerView } from "@/components/om/career/team-views";
import { LoadingGate } from "@/components/om/career/ui";
export const Route = createFileRoute("/equipe/joueur/$id")({
  head: () => ({
    meta: [
      { title: "Fiche joueur — Online Manager" },
      {
        name: "description",
        content:
          "Fiche joueur : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:title", content: "Fiche joueur — Online Manager" },
      {
        property: "og:description",
        content:
          "Fiche joueur : maquette de carrière football 2026–27 avec données fictives et changements temporaires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return (
    <LoadingGate id={id}>
      <PlayerView id={id} />
    </LoadingGate>
  );
}
