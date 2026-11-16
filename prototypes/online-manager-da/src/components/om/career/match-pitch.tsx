import { MATCH_PITCH_POSITIONS, type CareerPlayer } from "@/data/mock";

export function MatchPitch({ players }: { players: CareerPlayer[] }) {
  return <figure className="match-mini-pitch">
    <figcaption><span className="caps">Onze sur le terrain</span><span>Positions illustratives</span></figcaption>
    <svg viewBox="0 0 320 180" role="img" aria-label="Mini-carte illustrative du onze, sans suivi réel des joueurs">
      <rect className="match-pitch-grass" width="320" height="180" rx="8" />
      <g className="match-pitch-lines"><rect x="10" y="10" width="300" height="160" /><path d="M160 10V170M10 45H52V135H10M310 45H268V135H310M10 67H27V113H10M310 67H293V113H310" /><circle cx="160" cy="90" r="25" /><circle cx="160" cy="90" r="2" /></g>
      {players.map((player,i) => {
        const point=MATCH_PITCH_POSITIONS[i];
        if (!point) return null;
        return <g key={player.id} transform={`translate(${10+point[0]*3},${10+point[1]*1.6})`}><title>{player.name} · {player.position}</title><circle className="match-pitch-marker" r="10" /><text className="match-pitch-number" textAnchor="middle" dominantBaseline="central">{player.number}</text></g>;
      })}
    </svg>
  </figure>;
}