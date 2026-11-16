import { useState } from "react";
import { Sparkles, LockKeyhole } from "lucide-react";
import { CAREER_FIXTURES } from "@/data/mock";
import { useClubTheme } from "@/components/om/club-theme-provider";
import { useCareer } from "./session";
import { Action, Field, Panel } from "./ui";

export function TacticalAdvisor() {
  const { state } = useCareer();
  const { club } = useClubTheme();
  const fixture = CAREER_FIXTURES[state.current];
  const opponent = fixture?.opponent === "Rival"
    ? club.id === "barcelone" ? "Real Madrid" : "FC Barcelone"
    : fixture?.opponent ?? "";
  const [strengths, setStrengths] = useState("");
  const [opposition, setOpposition] = useState("");
  const [constraints, setConstraints] = useState("");
  return (
    <Panel title="Conseiller tactique IA" index="04" className="career-advisor">
      <p className="text-ink-2">{fixture ? `${club.name} face à ${opponent} · ${state.formation}` : "Saison terminée"}</p>
      <Field label="Points forts de votre effectif">
        <textarea rows={3} maxLength={2000} value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="Ailiers rapides, milieu créatif, défense solide…" />
      </Field>
      <Field label="Informations sur le prochain adversaire">
        <textarea rows={3} maxLength={2000} value={opposition} onChange={e => setOpposition(e.target.value)} placeholder="Formation, pressing, espaces laissés, joueurs à surveiller…" />
      </Field>
      <Field label="Contraintes et objectif">
        <textarea rows={2} maxLength={1000} value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="Joueurs fatigués, absents, résultat recherché…" />
      </Field>
      <p className="warning-tag" id="advisor-availability"><LockKeyhole size={16} aria-hidden="true" /> Génération indisponible dans ce brouillon : Lovable Cloud doit être activé depuis le chat principal.</p>
      <Action disabled title="Activation de Lovable Cloud requise"><Sparkles size={16} aria-hidden="true" />Générer le plan tactique</Action>
    </Panel>
  );
}