import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, MessageSquare, Undo2, Heart } from "lucide-react";
import { TRANSFER_TARGET, TRANSFER_DEMO, IMAGES } from "@/data/mock";
import { useClubTheme } from "@/components/om/club-theme-provider";
import { useCareer } from "./session";
import { PlayerDetail } from "./team-views";
import { Action, Confirm, Empty, Field, Flag, Go, Panel, Stat, money } from "./ui";
export function TransfersView() {
  const { state, update, notify } = useCareer();
  const [tab, setTab] = useState("Recrutement");
  const [stage, setStage] = useState(0);
  const [fee, setFee] = useState(18);
  const [salary, setSalary] = useState(55000);
  const [years, setYears] = useState(4);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [renew, setRenew] = useState<string | null>(null);
  const accept = () => {
    update((s) => ({
      ...s,
      transfer: true,
      budget: s.budget - TRANSFER_DEMO.fee - TRANSFER_DEMO.agent,
      salary: s.salary + TRANSFER_DEMO.salary,
      squad: [...s.squad, { ...TRANSFER_TARGET, status: "Rotation", contract: "30/06/2031" }],
      feed: [
        {
          id: "transfer-silva",
          title: "Silva rejoint le groupe (démo)",
          body: "Accord fictif : 18 M€, 55 000 €/semaine, quatre ans. Aucun paiement ni contrat réel.",
          type: "Mercato",
          destination: "/gestion/finances",
        },
        ...s.feed,
      ],
    }));
    notify("Recrue ajoutée et budget fictif ajusté pour cette session uniquement.");
    setConfirm(false);
    setStage(3);
  };
  return (
    <div>
      <div className="career-tabs" role="tablist" aria-label="Transferts et contrats">
        {["Recrutement", "Contrats"].map((t) => (
          <Action key={t} primary={tab === t} onClick={() => setTab(t)}>
            {t}
          </Action>
        ))}
      </div>
      {tab === "Contrats" ? (
        <Panel title="Contrats du groupe">
          <div className="career-table-scroll">
            <table className="career-table">
              <thead>
                <tr>
                  <th>Joueur</th>
                  <th>Échéance</th>
                  <th>Salaire / semaine</th>
                  <th>Décision</th>
                </tr>
              </thead>
              <tbody>
                {state.squad.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to="/equipe/joueur/$id" params={{ id: p.id }}>
                        {p.name}
                      </Link>
                    </td>
                    <td>{p.contract}</td>
                    <td>{money(p.salary)} €</td>
                    <td>
                      <Action onClick={() => setRenew(p.id)}>Proposer un renouvellement</Action>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <div className="career-two">
          <Panel title="Joueur suivi">
            <PlayerDetail player={TRANSFER_TARGET} />
            <p className="text-ink-2">
              Club vendeur fictif : Sporting Lisbonne. Négociation à étapes, sans marché réel.
            </p>
          </Panel>
          <Panel title="Négociation" index="02">
            <div className="career-negotiation-steps">
              {["Vendeur", "Joueur", "Finances"].map((s, i) => (
                <span className={stage === i ? "is-active" : ""} key={s}>
                  {i + 1} · {s}
                </span>
              ))}
            </div>
            {state.transfer || stage === 3 ? (
              <>
                <h3>Accord de démonstration conclu</h3>
                <p>
                  Silva est visible dans votre effectif. Les conditions restent fictives et non
                  sauvegardées.
                </p>
                <Go to="/equipe/effectif">Voir la recrue</Go>
                <Go to="/gestion/finances">Voir les finances</Go>
              </>
            ) : stage === 0 ? (
              <div className="career-decision-zone" aria-label="Négocier avec le club vendeur">
                <p>
                  Le vendeur demande 18 M€. Toute offre inférieure déclenche une contre-proposition
                  fixe.
                </p>
                <Field label="Offre au vendeur (M€)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                  />
                </Field>
                {error && (
                  <p role="alert" className="warning-tag">
                    {error}
                  </p>
                )}
                <Action
                  primary
                  onClick={() => {
                    if (fee < 18) {
                      setError("Contre-proposition : 18 M€. Vous pouvez accepter ou annuler.");
                      setFee(18);
                    } else {
                      setError("");
                      setFee(18);
                      setStage(1);
                      notify("Accord vendeur fictif : 18 M€.");
                    }
                  }}
                >
                  Envoyer l’offre au vendeur
                </Action>
                <Action
                  onClick={() => {
                    setFee(18);
                    setError("");
                    notify("Négociation réinitialisée.");
                  }}
                >
                  Réinitialiser
                </Action>
              </div>
            ) : stage === 1 ? (
              <div className="career-decision-zone" aria-label="Négocier le contrat avec le joueur">
                <p>Le joueur souhaite un salaire de 55 000 €/semaine et quatre ans.</p>
                <Field label="Salaire / semaine (€)">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                  />
                </Field>
                <Field label="Durée (années)">
                  <select value={years} onChange={(e) => setYears(Number(e.target.value))}>
                    {[2, 3, 4, 5].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </Field>
                {error && (
                  <p role="alert" className="warning-tag">
                    {error}
                  </p>
                )}
                <Action
                  primary
                  onClick={() => {
                    if (salary < 55000 || years < 4) {
                      setError("Contre-proposition fixe : 55 000 €/semaine sur quatre ans.");
                      setSalary(55000);
                      setYears(4);
                    } else {
                      setSalary(55000);
                      setYears(4);
                      setStage(2);
                      setError("");
                      notify("Accord joueur fictif obtenu.");
                    }
                  }}
                >
                  Proposer le contrat
                </Action>
                <Action
                  onClick={() => {
                    setStage(0);
                    setError("");
                  }}
                >
                  Retour au vendeur
                </Action>
              </div>
            ) : (
              <div className="career-decision-zone" aria-label="Vérifier les conditions financières">
                <h3>Récapitulatif financier</h3>
                <dl className="career-details">
                  <div>
                    <dt>Indemnité</dt>
                    <dd>18 M€</dd>
                  </div>
                  <div>
                    <dt>Commission fictive</dt>
                    <dd>1,2 M€</dd>
                  </div>
                  <div>
                    <dt>Salaire / semaine</dt>
                    <dd>55 000 €</dd>
                  </div>
                  <div>
                    <dt>Durée</dt>
                    <dd>4 ans</dd>
                  </div>
                  <div>
                    <dt>Budget après opération</dt>
                    <dd>{money(state.budget - 19.2)} M€</dd>
                  </div>
                </dl>
                <Action primary onClick={() => setConfirm(true)}>
                  Confirmer le transfert fictif
                </Action>
                <Action onClick={() => setStage(1)}>Revoir le contrat</Action>
                <Go to="/gestion/finances">Consulter les finances</Go>
              </div>
            )}
          </Panel>
        </div>
      )}
      <Confirm
        open={confirm}
        onOpenChange={setConfirm}
        title="Confirmer ce transfert fictif ?"
        description="Silva sera ajouté à l’effectif et 19,2 M€ retirés du budget de démonstration. Aucun paiement ni sauvegarde réelle."
      >
        <Action onClick={() => setConfirm(false)}>Annuler</Action>
        <Action primary onClick={accept}>
          Confirmer l’accord
        </Action>
      </Confirm>
      <Confirm
        open={renew !== null}
        onOpenChange={(v) => {
          if (!v) setRenew(null);
        }}
        title="Renouvellement de démonstration"
        description="L’échéance du contrat sera prolongée au 30 juin 2030 dans cette session, sans calcul salarial."
      >
        <Action onClick={() => setRenew(null)}>Annuler</Action>
        <Action
          primary
          onClick={() => {
            update((s) => ({
              ...s,
              squad: s.squad.map((p) => (p.id === renew ? { ...p, contract: "30/06/2030" } : p)),
            }));
            notify("Échéance prolongée temporairement au 30/06/2030.");
            setRenew(null);
          }}
        >
          Confirmer
        </Action>
      </Confirm>
    </div>
  );
}
export function FinancesView() {
  const { state } = useCareer();
  const [period, setPeriod] = useState("Saison");
  return (
    <div className="career-two">
      <Panel title="Situation financière">
        <Field label="Période">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>Saison</option>
            <option>Mois</option>
          </select>
        </Field>
        <div className="career-stats">
          <Stat label="Budget transfert" value={`${money(state.budget)} M€`} />
          <Stat
            label="Masse salariale annuelle"
            value={`${money(42.6 + (state.salary * 52) / 1000000)} M€`}
          />
          <Stat label="Solde d’exemple" value="+12,4 M€" />
        </div>
        <p className="text-ink-2">
          Montants fictifs. Le solde de saison n’est pas recalculé par les matchs.
        </p>
        <Go to="/gestion/transferts">Négocier un transfert</Go>
      </Panel>
      <Panel
        title={`${period === "Mois" ? "Novembre 2026" : "2026–27"} · Recettes et dépenses`}
        index="02"
      >
        <div className="career-finance-lines">
          {(period === "Mois"
            ? [
                ["Billetterie", 3.2],
                ["Partenaires", 2.4],
                ["Salaires", -3.55],
                ["Fonctionnement", -0.8],
              ]
            : [
                ["Billetterie", 28.6],
                ["Partenaires", 42.4],
                ["Droits TV", 36.8],
                ["Salaires", -42.6],
                ["Fonctionnement", -18.2],
              ]
          ).map(([label, value]) => (
            <div key={String(label)}>
              <span>{label}</span>
              <div>
                <meter min={0} max={50} value={Math.abs(Number(value))} />
                <strong className="font-mono">
                  {Number(value) > 0 ? "+" : ""}
                  {money(Number(value))} M€
                </strong>
              </div>
            </div>
          ))}
        </div>
        {state.transfer && (
          <p className="warning-tag">
            Transfert Silva : −19,2 M€ du budget disponible ; +55 000 €/semaine.
          </p>
        )}
        <p>
          Dernière opération :{" "}
          {state.transfer ? "accord Silva de démonstration" : "aucune opération dans cette session"}
          .
        </p>
      </Panel>
    </div>
  );
}
export function DiscussionsView() {
  const { state, update, notify } = useCareer();
  const [tab, setTab] = useState("Discussion");
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const [undo, setUndo] = useState(false);
  const [selected, setSelected] = useState(state.selectedPlayer);
  const player = state.squad.find((p) => p.id === selected);
  const promise = () => {
    const id = `promise-${selected}`;
    update((s) => ({
      ...s,
      promises: [
        ...s.promises.filter((p) => p.id !== id),
        {
          id,
          player: player?.name ?? "Joueur",
          text: "Accorder du temps de jeu dans les trois prochaines rencontres",
          status: "En cours",
        },
      ],
      feed: [
        {
          id: `discussion-${Date.now()}`,
          title: "Une promesse au vestiaire",
          body: `${player?.name} attend davantage de temps de jeu. Suivi manuel, sans calcul automatique.`,
          type: "Vestiaire",
          destination: "/gestion/discussions",
        },
        ...s.feed,
      ],
    }));
    setReply("Merci coach, j’attends les prochaines rencontres.");
    setUndo(true);
    setOpen(false);
    notify("Promesse temporaire ajoutée. Vous pouvez l’annuler.");
  };
  return (
    <div>
      <div className="career-tabs">
        {["Discussion", "Promesses"].map((t) => (
          <Action key={t} primary={tab === t} onClick={() => setTab(t)}>
            {t} {t === "Promesses" && state.promises.length > 0 ? `(${state.promises.length})` : ""}
          </Action>
        ))}
      </div>
      {tab === "Discussion" ? (
        <div className="career-two">
          <Panel title="Choisir un interlocuteur">
            <Field label="Joueur">
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setReply("");
                  setUndo(false);
                }}
              >
                {state.squad.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            {player && <PlayerDetail player={player} compact />}
          </Panel>
          <Panel title="Conversation de démonstration" index="02">
            <div className="career-conversation">
              <p className="caps text-ink-2">{player?.name}</p>
              <blockquote>
                « Coach, quel rôle me réservez-vous ? J’aimerais avoir plus de temps de jeu. »
              </blockquote>
              {reply && (
                <div className="career-reply">
                  <span className="caps">Réponse du joueur</span>
                  <p>{reply}</p>
                </div>
              )}
            </div>
            <div className="career-choices">
              <Action onClick={() => setOpen(true)}>Promettre du temps de jeu</Action>
              <Action
                onClick={() => {
                  setReply("Je comprends. Je vais continuer à travailler pour gagner ma place.");
                  notify("Réponse de démonstration envoyée, sans évolution réelle de l’humeur.");
                }}
              >
                Expliquer la concurrence
              </Action>
              <Action
                onClick={() => {
                  setReply("D’accord, parlons-en après le prochain match.");
                  notify("Discussion reportée dans la démo.");
                }}
              >
                Reporter la discussion
              </Action>
            </div>
            {undo && (
              <Action
                onClick={() => {
                  update((s) => ({
                    ...s,
                    promises: s.promises.filter((p) => p.id !== `promise-${selected}`),
                  }));
                  setUndo(false);
                  setReply("");
                  notify("Promesse annulée pour cette session.");
                }}
              >
                <Undo2 size={16} />
                Annuler la promesse
              </Action>
            )}
            <Go to="/equipe/tactique">Adapter la composition</Go>
          </Panel>
        </div>
      ) : (
        <Panel title="Suivi des promesses">
          {state.promises.length === 0 ? (
            <Empty>
              Aucune promesse en cours.{" "}
              <Action onClick={() => setTab("Discussion")}>Ouvrir une discussion</Action>
            </Empty>
          ) : (
            state.promises.map((p) => (
              <div className="career-promise" key={p.id}>
                <div>
                  <strong>{p.player}</strong>
                  <p>{p.text}</p>
                  <span className="career-tag">{p.status}</span>
                </div>
                <Field label="Suivi manuel">
                  <select
                    value={p.status}
                    onChange={(e) => {
                      const status = e.target.value;
                      if (status === "En cours" || status === "Tenue" || status === "Abandonnée")
                        update((s) => ({
                          ...s,
                          promises: s.promises.map((item) =>
                            item.id === p.id ? { ...item, status } : item,
                          ),
                        }));
                      notify("Statut de promesse mis à jour manuellement.");
                    }}
                  >
                    <option>En cours</option>
                    <option>Tenue</option>
                    <option>Abandonnée</option>
                  </select>
                </Field>
              </div>
            ))
          )}
          <p className="text-ink-2">
            Le suivi est manuel et temporaire. Aucun moteur ne vérifie automatiquement les
            promesses.
          </p>
        </Panel>
      )}
      <Confirm
        open={open}
        onOpenChange={setOpen}
        title="Faire cette promesse ?"
        description="Promettre du temps de jeu dans les trois prochaines rencontres. Le suivi sera manuel, sans effet sportif automatique."
      >
        <Action onClick={() => setOpen(false)}>Annuler</Action>
        <Action primary onClick={promise}>
          Confirmer la promesse
        </Action>
      </Confirm>
    </div>
  );
}
export function PressView() {
  const { state, update, notify } = useCareer();
  const [answer, setAnswer] = useState("");
  const [sent, setSent] = useState(false);
  const [undo, setUndo] = useState<string | null>(null);
  return (
    <div className="career-two">
      <Panel title="Conférence de presse">
        <img
          className="career-press-image"
          src={IMAGES.press}
          alt="Joueur à une conférence de presse"
        />
        <p className="caps text-ink-2">Journaliste · Avant / après match</p>
        <h3>« Comment abordez-vous le prochain rendez-vous ? »</h3>
        <p className="text-ink-2">
          Une réponse de démonstration sera affichée dans le fil, sans effet sur l’équipe.
        </p>
      </Panel>
      <Panel title="Votre réponse" index="02">
        <div className="career-choices">
          {[
            "Nous restons concentrés sur notre jeu.",
            "Le groupe doit montrer une réaction.",
            "Nous faisons confiance à nos jeunes.",
          ].map((text) => (
            <Action
              key={text}
              primary={answer === text}
              onClick={() => {
                setAnswer(text);
                setSent(false);
              }}
            >
              {text}
            </Action>
          ))}
        </div>
        <Action
          primary
          disabled={!answer || sent}
          onClick={() => {
            const id = `press-${Date.now()}`;
            update((s) => ({
              ...s,
              feed: [
                {
                  id,
                  title: "Le coach prend la parole",
                  body: answer,
                  type: "Presse",
                  destination: "/gestion/presse",
                },
                ...s.feed,
              ],
            }));
            setUndo(id);
            setSent(true);
            notify("Réponse de presse reprise dans le fil de cette session.");
          }}
        >
          {sent ? "Réponse envoyée" : "Envoyer la réponse"}
        </Action>
        {sent && (
          <>
            <Go to="/medias/fil">Voir le fil du club</Go>
            <Action
              onClick={() => {
                update((s) => ({ ...s, feed: s.feed.filter((e) => e.id !== undo) }));
                setSent(false);
                setUndo(null);
                notify("Réponse de presse annulée.");
              }}
            >
              <Undo2 size={16} />
              Annuler l’envoi
            </Action>
          </>
        )}
      </Panel>
    </div>
  );
}
export function FeedView() {
  const { state } = useCareer();
  const [filter, setFilter] = useState("Tous");
  const [likes, setLikes] = useState<string[]>([]);
  const [comment, setComment] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const events = state.feed.filter((e) => filter === "Tous" || e.type === filter);
  return (
    <div>
      <div className="career-toolbar">
        <Field label="Événements">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["Tous", "Staff", "Vestiaire", "Mercato", "Match", "Saison", "Presse"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Go to="/gestion/presse">Conférence de presse</Go>
      </div>
      <div className="career-feed-grid">
        {events.length === 0 ? (
          <Empty>
            Aucun événement de cette catégorie. Les actions de la démo alimentent ce fil.
          </Empty>
        ) : (
          events.map((e, i) => (
            <article className="sheet career-feed-item" key={e.id}>
              <div className="career-panel-heading">
                <span className="caps text-club-ink">{e.type}</span>
                <span className="font-mono text-ink-3">2026–27</span>
              </div>
              {i === 0 && (
                <img
                  src={e.type === "Presse" ? IMAGES.press : IMAGES.background}
                  alt={e.type === "Presse" ? "Conférence du club" : "Stade du club"}
                />
              )}
              <div className="career-panel-body">
                <h2>{e.title}</h2>
                <p>{e.body}</p>
                <Link
                  to={
                    e.destination === "/equipe/tactique"
                      ? "/equipe/tactique"
                      : e.destination === "/gestion/discussions"
                        ? "/gestion/discussions"
                        : e.destination === "/gestion/transferts"
                          ? "/gestion/transferts"
                          : e.destination === "/gestion/finances"
                            ? "/gestion/finances"
                            : e.destination === "/saison/calendrier"
                              ? "/saison/calendrier"
                              : e.destination === "/equipe/entrainement"
                                ? "/equipe/entrainement"
                                : "/gestion/presse"
                  }
                  className="career-context-link"
                >
                  Ouvrir l’événement <ArrowRight size={16} />
                </Link>
                <div className="career-actions">
                  <Action
                    aria-label={`Aimer ${e.title}`}
                    onClick={() =>
                      setLikes((ids) =>
                        ids.includes(e.id) ? ids.filter((id) => id !== e.id) : [...ids, e.id],
                      )
                    }
                  >
                    <Heart size={16} className={likes.includes(e.id) ? "text-club-ink" : ""} />
                    {likes.includes(e.id) ? "Aimé" : "J’aime"}
                  </Action>
                  <Action onClick={() => setComment(comment === e.id ? null : e.id)}>
                    <MessageSquare size={16} />
                    Commentaires ({comments[e.id]?.length ?? 0})
                  </Action>
                </div>
                {comment === e.id && (
                  <div className="career-comment-form">
                    {comments[e.id]?.map((c, j) => (
                      <p key={j}>
                        <strong>Vous :</strong> {c}
                      </p>
                    ))}
                    <Field label="Commentaire temporaire">
                      <input
                        value={text}
                        maxLength={200}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Votre commentaire"
                      />
                    </Field>
                    <Action
                      disabled={!text.trim()}
                      onClick={() => {
                        setComments((s) => ({ ...s, [e.id]: [...(s[e.id] ?? []), text.trim()] }));
                        setText("");
                      }}
                    >
                      Envoyer
                    </Action>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
export function CoachView() {
  const { state } = useCareer();
  const { club } = useClubTheme();
  return (
    <div className="career-two">
      <Panel title="Profil du coach">
        <p className="caps text-ink-2">{club.name} · Depuis août 2026</p>
        <h2 className="career-section-title">{state.coach}</h2>
        <div className="career-stats">
          <Stat label="Réputation fictive" value="72 / 100" />
          <Stat label="Contrat" value="Juin 2028" />
          <Stat label="Confiance" value="Satisfaisante" />
        </div>
        <dl className="career-details">
          <div>
            <dt>Style</dt>
            <dd>Jeu collectif</dd>
          </div>
          <div>
            <dt>Objectif</dt>
            <dd>Top 4</dd>
          </div>
          <div>
            <dt>Saison</dt>
            <dd>2026–27</dd>
          </div>
        </dl>
        <Go to="/gestion/discussions">Suivre les promesses</Go>
        <Go to="/carriere/sauvegardes">Instantané temporaire</Go>
      </Panel>
      <Panel title="Parcours & objectifs" index="02">
        <div className="career-timeline">
          <div>
            <span className="font-mono">08/2026</span>
            <strong>Prise de poste</strong>
            <p>Objectif : une qualification européenne.</p>
          </div>
          <div>
            <span className="font-mono">11/2026</span>
            <strong>Premier bilan de la direction</strong>
            <p>Le groupe occupe la deuxième place dans le tableau fictif.</p>
          </div>
          <div>
            <span className="font-mono">05/2027</span>
            <strong>{state.current >= 38 ? "Saison terminée" : "Bilan de saison à venir"}</strong>
            <p>Le bilan V1 est scénarisé, sans évolution de carrière réelle.</p>
          </div>
        </div>
        <Go to="/saison/bilan">Fin de saison</Go>
        <Go to="/gestion/presse">Prendre la parole</Go>
      </Panel>
    </div>
  );
}
