import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChartNoAxesColumn,
  Mail,
  Shield,
  Users,
} from "lucide-react";
import { Link } from "react-router";

type ScreenId = "start" | "hub" | "squad" | "tactics" | "match" | "review" | "training" | "market";
type ViewMode = "wireframe" | "mockup";

const SCREENS: { id: ScreenId; label: string; group: string; purpose: string; next: string }[] = [
  {
    id: "start",
    label: "Nouvelle carrière",
    group: "Démarrer",
    purpose:
      "Choisir une compétition, un club, puis vérifier son effectif avant de créer la sauvegarde.",
    next: "Le choix du club crée une carrière locale et charge son calendrier.",
  },
  {
    id: "hub",
    label: "Accueil du club",
    group: "Gérer la semaine",
    purpose: "Voir la prochaine échéance, les messages importants et les actions à prendre.",
    next: "Depuis l’accueil, tu ouvres l’effectif, la tactique, l’entraînement ou le marché.",
  },
  {
    id: "squad",
    label: "Effectif",
    group: "Gérer la semaine",
    purpose: "Comparer les joueurs, leur rôle, leur moral, leur forme et leur disponibilité.",
    next: "La sélection des joueurs alimente la composition et la simulation du match.",
  },
  {
    id: "tactics",
    label: "Composition et tactique",
    group: "Préparer le match",
    purpose: "Placer les titulaires, choisir une formation et adapter le style à l’adversaire.",
    next: "La feuille de match et les consignes sont envoyées au moteur de simulation.",
  },
  {
    id: "match",
    label: "Avant-match et match",
    group: "Préparer le match",
    purpose: "Confirmer le onze, suivre les temps forts et décider si tu simules la rencontre.",
    next: "Le résultat met à jour le calendrier, la fatigue, le classement et les messages.",
  },
  {
    id: "review",
    label: "Après-match",
    group: "Faire progresser le club",
    purpose: "Comprendre le résultat grâce aux occasions, aux notes et aux réactions du vestiaire.",
    next: "Le calendrier avance au prochain jour et les joueurs récupèrent selon leur charge.",
  },
  {
    id: "training",
    label: "Entraînement",
    group: "Faire progresser le club",
    purpose: "Choisir la charge de la semaine, améliorer des attributs et gérer la fatigue.",
    next: "Les effets d’entraînement sont calculés par la carrière, puis visibles sur l’effectif.",
  },
  {
    id: "market",
    label: "Transferts et contrats",
    group: "Faire progresser le club",
    purpose: "Repérer un joueur, négocier son arrivée ou prolonger un membre de l’équipe.",
    next: "Une transaction modifie l’effectif et les finances de la sauvegarde.",
  },
];

function V1Wireframes() {
  const [screenId, setScreenId] = useState<ScreenId>("start");
  const [mode, setMode] = useState<ViewMode>("wireframe");
  const [notice, setNotice] = useState("");
  const screen = SCREENS.find((item) => item.id === screenId)!;
  const polished = mode === "mockup";
  const frame = polished
    ? "rounded-2xl border border-white/10 bg-[#111923] text-white shadow-2xl"
    : "rounded-xl border-2 border-dashed border-slate-400 bg-white text-slate-700";
  const panel = polished
    ? "rounded-xl border border-white/10 bg-white/[0.045]"
    : "rounded-lg border border-dashed border-slate-300 bg-slate-50";
  const muted = polished ? "text-slate-400" : "text-slate-500";
  const accent = polished ? "text-emerald-300" : "text-slate-600";
  const button = polished
    ? "rounded-lg bg-emerald-400 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-300"
    : "rounded-lg border-2 border-dashed border-slate-500 px-4 py-2 font-semibold";
  const clubButton = (label: string, selected = false) => (
    <button
      type="button"
      onClick={() => setNotice(`${label} sélectionné pour la démonstration.`)}
      className={`${panel} ${selected && polished ? "border-emerald-300/70 bg-emerald-300/10" : ""} flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:border-emerald-300/60`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-400/15 font-bold text-emerald-300">
          {label.slice(0, 2).toUpperCase()}
        </span>
        <span className="truncate font-semibold">{label}</span>
      </span>
      <span className={muted}>Voir</span>
    </button>
  );

  function renderScreen() {
    switch (screenId) {
      case "start":
        return (
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <section className={`${panel} space-y-4 p-4`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Étape 1 · Compétition
              </p>
              <h2 className="text-xl font-bold">Choisis ton championnat</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Espagne · Liga",
                  "Angleterre · Premier League",
                  "France · Ligue 1",
                  "Italie · Serie A",
                  "Écosse · Premiership",
                  "Maroc · Botola Pro",
                ].map((league) => (
                  <button
                    key={league}
                    type="button"
                    onClick={() => setNotice(`${league} choisi pour la démonstration.`)}
                    className={`${panel} p-3 text-left text-sm font-semibold hover:border-emerald-300/60`}
                  >
                    {league}
                  </button>
                ))}
              </div>
              <p className={`text-xs ${muted}`}>
                Le jeu charge les vrais clubs et les joueurs du pack local. Les évaluations de jeu
                restent signalées comme estimées.
              </p>
            </section>
            <section className={`${panel} space-y-3 p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                    Étape 2 · Club
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Liga · Saison 2026-27</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  20 clubs
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Real Madrid",
                  "FC Barcelone",
                  "Atlético de Madrid",
                  "Real Betis",
                  "Valence",
                  "Real Sociedad",
                ].map((club, index) => (
                  <div key={club}>{clubButton(club, index === 0)}</div>
                ))}
              </div>
              <div className={`${panel} flex flex-wrap items-center justify-between gap-3 p-3`}>
                <div>
                  <p className="font-bold">Real Madrid</p>
                  <p className={`text-sm ${muted}`}>31 joueurs · effectif et calendrier chargés</p>
                </div>
                <button
                  type="button"
                  className={button}
                  onClick={() =>
                    setNotice(
                      "Carrière de démonstration créée. Le prochain écran est l’accueil du club.",
                    )
                  }
                >
                  Créer la carrière
                </button>
              </div>
            </section>
          </div>
        );
      case "hub":
        return (
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4">
              <section className={`${panel} p-5`}>
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                  Prochain match · J12
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase">
                  Real Madrid <span className={accent}>vs</span> Séville
                </h2>
                <p className={`mt-2 ${muted}`}>Samedi 15 août · 20 h 00 · Santiago Bernabéu</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button className={button} type="button" onClick={() => setScreenId("tactics")}>
                    Préparer le match
                  </button>
                  <button
                    className={`${panel} px-4 py-2 font-semibold`}
                    type="button"
                    onClick={() => setScreenId("squad")}
                  >
                    Voir l’effectif
                  </button>
                </div>
              </section>
              <section className={`${panel} p-4`}>
                <h3 className="font-bold">À faire cette semaine</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    ["Composition", "À confirmer"],
                    ["Entraînement", "Charge moyenne"],
                    ["Contrat de L. Vázquez", "Expire dans 6 mois"],
                  ].map(([title, value]) => (
                    <div key={title} className={`${panel} p-3`}>
                      <p className={`text-xs ${muted}`}>{title}</p>
                      <p className="mt-1 text-sm font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <aside className="space-y-4">
              <section className={`${panel} p-4`}>
                <div className="flex items-center gap-2">
                  <Mail className={accent} size={17} />
                  <h3 className="font-bold">Boîte de réception</h3>
                </div>
                <p className={`mt-3 ${muted}`}>
                  Le conseil attend une qualification européenne cette saison.
                </p>
                <button
                  type="button"
                  className={`mt-3 text-sm font-bold ${accent}`}
                  onClick={() => setNotice("Message ouvert : objectif européen confirmé.")}
                >
                  Lire le message
                </button>
              </section>
              <section className={`${panel} p-4`}>
                <h3 className="font-bold">Dernier résultat</h3>
                <p className="mt-3 text-xl font-black">Real Madrid 3 — 2 Real Sociedad</p>
                <p className={`mt-1 text-sm ${muted}`}>
                  Le classement et la fatigue ont été mis à jour.
                </p>
              </section>
            </aside>
          </div>
        );
      case "squad":
        return (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className={`${panel} p-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                    Real Madrid · Équipe A
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Effectif</h2>
                </div>
                <button type="button" className={`${panel} px-3 py-2 text-sm font-semibold`}>
                  Équipe A · Réserve
                </button>
              </div>
              <div className="mt-4 grid grid-cols-[1.5fr_0.6fr_0.7fr_0.7fr] gap-2 border-b border-white/10 pb-2 text-xs font-bold uppercase">
                <span>Joueur</span>
                <span>Poste</span>
                <span>Rôle</span>
                <span>Forme</span>
              </div>
              {[
                ["Thibaut Courtois", "GB", "Indiscutable", "Bonne"],
                ["Antonio Rüdiger", "DC", "Indiscutable", "Bonne"],
                ["Federico Valverde", "MC", "Titulaire", "Très bonne"],
                ["Vinícius Júnior", "AG", "Indiscutable", "Neutre"],
                ["Endrick", "BU", "Rotation", "Bonne"],
              ].map((row) => (
                <button
                  key={row[0]}
                  type="button"
                  onClick={() => setNotice(`Fiche de ${row[0]} ouverte.`)}
                  className={`${panel} mt-2 grid w-full grid-cols-[1.5fr_0.6fr_0.7fr_0.7fr] gap-2 p-3 text-left text-sm hover:border-emerald-300/60`}
                >
                  <span className="font-semibold">{row[0]}</span>
                  <span className={muted}>{row[1]}</span>
                  <span className="truncate">{row[2]}</span>
                  <span className={accent}>{row[3]}</span>
                </button>
              ))}
            </section>
            <section className={`${panel} space-y-3 p-4`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Fiche joueur
              </p>
              <h2 className="text-2xl font-black">Federico Valverde</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Âge", "28"],
                  ["Nationalité", "Uruguay"],
                  ["Taille", "182 cm"],
                  ["Moral", "67 / 100"],
                  ["Rôle", "Titulaire"],
                  ["Niveau", "Estimé par le jeu"],
                ].map(([key, value]) => (
                  <div key={key} className={`${panel} p-3`}>
                    <p className={`text-xs ${muted}`}>{key}</p>
                    <p className="mt-1 font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <p className={`text-xs ${muted}`}>
                Les valeurs de jeu sont des estimations. Le moral et le rôle évoluent dans la
                sauvegarde.
              </p>
            </section>
          </div>
        );
      case "tactics":
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <section className={`${panel} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                    Onze de départ
                  </p>
                  <h2 className="mt-1 text-2xl font-black">4-3-3 · Possession</h2>
                </div>
                <button
                  type="button"
                  className={`${panel} px-3 py-2 text-sm`}
                  onClick={() => setNotice("Formation changée pour la démonstration.")}
                >
                  Changer de formation
                </button>
              </div>
              <div className="mt-4 grid min-h-80 grid-rows-4 gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] p-3">
                {[
                  ["Courtois"],
                  ["Mendy", "Rüdiger", "Militão", "Carvajal"],
                  ["Bellingham", "Tchouaméni", "Valverde"],
                  ["Vinícius", "Mbappé", "Rodrygo"],
                ].map((line, index) => (
                  <div key={index} className="flex items-center justify-around gap-2">
                    {line.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setNotice(`${name} remplacé ou repositionné.`)}
                        className="rounded-full border border-white/15 bg-[#18252b] px-3 py-2 text-xs font-bold shadow"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </section>
            <section className={`${panel} space-y-4 p-4`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>Consignes</p>
              {[
                ["Pressing", "Médian"],
                ["Largeur", "Équilibrée"],
                ["Rythme", "Rapide"],
              ].map(([label, value]) => (
                <label key={label} className="block">
                  <span className="mb-1 flex justify-between text-sm">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </span>
                  <input type="range" className="w-full accent-emerald-400" defaultValue={60} />
                </label>
              ))}
              <div className={`${panel} p-3`}>
                <p className="font-bold">Adversaire · Séville</p>
                <p className={`mt-1 text-sm ${muted}`}>
                  Bloc compact, transitions rapides. Un pressing haut augmente les risques de
                  fatigue.
                </p>
              </div>
              <button type="button" className={button} onClick={() => setScreenId("match")}>
                Valider la feuille de match
              </button>
            </section>
          </div>
        );
      case "match":
        return (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <section className={`${panel} p-5`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Liga · 15 août 2026
              </p>
              <div className="my-6 flex items-center justify-between gap-4 text-center">
                <div className="flex-1">
                  <Shield className="mx-auto mb-2 text-emerald-300" size={32} />
                  <p className="font-black">Real Madrid</p>
                </div>
                <div>
                  <p className="text-5xl font-black">
                    2 <span className={muted}>—</span> 1
                  </p>
                  <p className={`mt-2 text-sm ${muted}`}>67e minute</p>
                </div>
                <div className="flex-1">
                  <Shield className="mx-auto mb-2 text-slate-400" size={32} />
                  <p className="font-black">Séville</p>
                </div>
              </div>
              <div className={`${panel} space-y-3 p-4`}>
                <p className="font-bold">Temps forts</p>
                <p className={`text-sm ${muted}`}>
                  24’ Mbappé reprend un centre de Valverde. Arrêt du gardien.
                </p>
                <p className={`text-sm ${muted}`}>
                  51’ Vinícius déborde et marque au premier poteau.
                </p>
                <p className={`text-sm ${muted}`}>
                  64’ Séville réduit l’écart sur une transition rapide.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={button} onClick={() => setScreenId("review")}>
                  Terminer le match
                </button>
                <button
                  type="button"
                  className={`${panel} px-4 py-2 font-semibold`}
                  onClick={() => setNotice("La simulation avance jusqu’au coup de sifflet final.")}
                >
                  Simuler jusqu’à la fin
                </button>
              </div>
            </section>
            <section className={`${panel} p-4`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Statistiques du match
              </p>
              <div className="mt-4 space-y-4">
                {[
                  ["Possession", "61%", "39%"],
                  ["Tirs", "13", "7"],
                  ["Tirs cadrés", "6", "3"],
                  ["Occasions franches", "3", "1"],
                ].map(([label, home, away]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm">
                      <span>{home}</span>
                      <span className={muted}>{label}</span>
                      <span>{away}</span>
                    </div>
                    <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="bg-emerald-300"
                        style={{
                          width: `${(Number.parseInt(home) / (Number.parseInt(home) + Number.parseInt(away))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className={`mt-5 text-xs ${muted}`}>
                Résultat de démonstration. La simulation réelle produit les statistiques à partir
                des joueurs et des tactiques choisis.
              </p>
            </section>
          </div>
        );
      case "review":
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <section className={`${panel} p-5`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Résultat final
              </p>
              <h2 className="mt-2 text-3xl font-black">Real Madrid 2 — 1 Séville</h2>
              <p className={`mt-2 ${muted}`}>
                Victoire · 3 points · classement et forme mis à jour
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  ["Homme du match", "Federico Valverde"],
                  ["Note moyenne", "7,2"],
                  ["Fatigue", "+18 points"],
                ].map(([label, value]) => (
                  <div key={label} className={`${panel} p-3`}>
                    <p className={`text-xs ${muted}`}>{label}</p>
                    <p className="mt-1 font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={`${button} mt-5`}
                onClick={() => setNotice("Le calendrier avance au prochain jour de la carrière.")}
              >
                Continuer la carrière
              </button>
            </section>
            <section className={`${panel} p-4`}>
              <h3 className="font-bold">Réactions</h3>
              <p className={`mt-3 ${muted}`}>
                Le conseil se réjouit du résultat. Les remplaçants attendent davantage de minutes.
              </p>
              <p className={`mt-4 text-sm ${muted}`}>
                Ces réactions sont générées par les événements de la sauvegarde et les attentes des
                personnages.
              </p>
            </section>
          </div>
        );
      case "training":
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <section className={`${panel} p-4`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Semaine · 17–23 août
              </p>
              <h2 className="mt-1 text-2xl font-black">Plan d’entraînement</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Lun", "Récupération"],
                  ["Mar", "Tactique"],
                  ["Mer", "Intensité"],
                  ["Jeu", "Technique"],
                  ["Ven", "Pré-match"],
                  ["Sam", "Match"],
                  ["Dim", "Repos"],
                ].map(([day, session]) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setNotice(`${session} sélectionné pour ${day}.`)}
                    className={`${panel} min-h-20 p-3 text-left`}
                  >
                    <p className={`text-xs ${muted}`}>{day}</p>
                    <p className="mt-2 text-sm font-bold">{session}</p>
                  </button>
                ))}
              </div>
            </section>
            <section className={`${panel} p-4`}>
              <ChartNoAxesColumn className={accent} size={20} />
              <h3 className="mt-2 font-bold">Effets prévus</h3>
              <p className={`mt-3 text-sm ${muted}`}>
                Charge moyenne : 62/100. La séance tactique augmente la familiarité collective. La
                récupération réduit le risque de blessure.
              </p>
              <button
                type="button"
                className={`${button} mt-5`}
                onClick={() => setNotice("Le plan est enregistré dans la démonstration.")}
              >
                Enregistrer le plan
              </button>
            </section>
          </div>
        );
      case "market":
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <section className={`${panel} p-4`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Marché des transferts
              </p>
              <h2 className="mt-1 text-2xl font-black">Renforcer le milieu</h2>
              <div className="mt-4 space-y-2">
                {[
                  ["Martín Zubimendi", "MDC · 27 ans", "45 M€"],
                  ["Morten Hjulmand", "MDC · 27 ans", "32 M€"],
                  ["João Neves", "MC · 21 ans", "72 M€"],
                ].map(([name, detail, value]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setNotice(`Négociation ouverte pour ${name}.`)}
                    className={`${panel} flex w-full items-center justify-between gap-3 p-3 text-left`}
                  >
                    <span>
                      <strong className="block">{name}</strong>
                      <span className={`text-sm ${muted}`}>{detail}</span>
                    </span>
                    <span className="font-bold">{value}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className={`${panel} space-y-3 p-4`}>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>
                Négociation
              </p>
              <h3 className="text-xl font-black">Proposition de contrat</h3>
              <label className="block text-sm">
                Durée du contrat
                <select className="mt-1 h-10 w-full rounded-lg bg-slate-900 px-3">
                  <option>4 ans</option>
                  <option>3 ans</option>
                  <option>5 ans</option>
                </select>
              </label>
              <label className="block text-sm">
                Salaire hebdomadaire
                <input
                  className="mt-1 h-10 w-full rounded-lg bg-slate-900 px-3"
                  defaultValue="180 000 €"
                />
              </label>
              <div className={`${panel} p-3`}>
                <p className={`text-sm ${muted}`}>Budget transfert disponible</p>
                <p className="mt-1 font-bold">82 M€</p>
              </div>
              <button
                type="button"
                className={button}
                onClick={() =>
                  setNotice("Offre envoyée. Le club et le joueur peuvent répondre ou négocier.")
                }
              >
                Envoyer l’offre
              </button>
            </section>
          </div>
        );
    }
  }

  const groups = [...new Set(SCREENS.map((item) => item.group))];
  const currentIndex = SCREENS.findIndex((item) => item.id === screenId);
  const go = (direction: number) => {
    const target = SCREENS[(currentIndex + direction + SCREENS.length) % SCREENS.length]!;
    setScreenId(target.id);
    setNotice("");
  };

  return (
    <main className="min-h-dvh bg-[#0c1118] px-3 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Online Manager · Prototype de compréhension
            </p>
            <h1 className="mt-1 text-2xl font-black uppercase sm:text-3xl">
              La carrière, écran par écran
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            Retour au jeu
          </Link>
        </header>

        <div className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)_285px]">
          <nav
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            aria-label="Écrans de la carrière"
          >
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Parcours de la V1
            </p>
            {groups.map((group) => (
              <div key={group} className="mb-4">
                <p className="px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-500">
                  {group}
                </p>
                {SCREENS.filter((item) => item.group === group).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={screenId === item.id ? "page" : undefined}
                    onClick={() => {
                      setScreenId(item.id);
                      setNotice("");
                    }}
                    className={`mt-1 w-full rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors ${screenId === item.id ? "bg-emerald-300 text-slate-950" : "text-slate-300 hover:bg-white/5"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <section className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  {screen.group}
                </p>
                <h2 className="mt-1 text-xl font-bold">{screen.label}</h2>
              </div>
              <div
                className="flex rounded-lg border border-white/15 p-1"
                role="group"
                aria-label="Style de la maquette"
              >
                <button
                  type="button"
                  aria-pressed={mode === "wireframe"}
                  onClick={() => setMode("wireframe")}
                  className={`rounded-md px-3 py-1.5 text-sm font-bold ${mode === "wireframe" ? "bg-white text-slate-950" : "text-slate-300"}`}
                >
                  Wireframe
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "mockup"}
                  onClick={() => setMode("mockup")}
                  className={`rounded-md px-3 py-1.5 text-sm font-bold ${mode === "mockup" ? "bg-emerald-300 text-slate-950" : "text-slate-300"}`}
                >
                  Maquette
                </button>
              </div>
            </div>
            <div className={`${frame} min-h-[580px] p-4 sm:p-6`}>
              <div
                className={`mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${polished ? "border-white/10" : "border-dashed border-slate-300"}`}
              >
                <div className="flex items-center gap-2">
                  <Shield size={19} className={accent} />
                  <span className="font-black uppercase tracking-wide">Real Madrid</span>
                  <span className={muted}>· Saison 2026-27</span>
                </div>
                <div className={`flex items-center gap-4 text-xs ${muted}`}>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} /> 15 août 2026
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} /> Carrière locale
                  </span>
                </div>
              </div>
              {renderScreen()}
              {notice ? (
                <p
                  role="status"
                  className={`mt-4 rounded-lg p-3 text-sm font-semibold ${polished ? "bg-emerald-300/10 text-emerald-100" : "border border-dashed border-slate-400"}`}
                >
                  {notice}
                </p>
              ) : null}
              <div
                className={`mt-5 flex items-center justify-between border-t pt-4 ${polished ? "border-white/10" : "border-dashed border-slate-300"}`}
              >
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className={`${panel} inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold`}
                >
                  <ArrowLeft size={15} />
                  Précédent
                </button>
                <span className={`text-xs ${muted}`}>
                  Écran {currentIndex + 1} sur {SCREENS.length}
                </span>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className={`${panel} inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold`}
                >
                  Suivant
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-3">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                À quoi sert cet écran
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{screen.purpose}</p>
            </section>
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Ce qui se passe ensuite
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{screen.next}</p>
            </section>
            <section className="rounded-2xl border border-amber-300/20 bg-amber-200/[0.05] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                Prototype de parcours
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Les écrans et exemples servent à expliquer la boucle de carrière. Les boutons
                démontrent la navigation ; les données affichées ne créent pas encore une vraie
                sauvegarde.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export { V1Wireframes };
