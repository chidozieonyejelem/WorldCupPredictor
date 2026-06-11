import React from "react";
import { useTournament } from "../../hooks/useTournament.js";
import BracketMatch from "./BracketMatch.jsx";

// The bracket halves: the first half of each round feeds into one SF, the second half into the other.
// R32[0..7] → R16[0..3] → QF[0..1] → SF[0]
// R32[8..15] → R16[4..7] → QF[2..3] → SF[1]
function splitHalves(matches, expected) {
  const padded = matches.length >= expected ? matches.slice(0, expected) : [
    ...matches,
    ...Array.from({ length: expected - matches.length }, () => null),
  ];
  const mid = expected / 2;
  return { left: padded.slice(0, mid), right: padded.slice(mid) };
}

function Column({ label, matches, alignRight = false }) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className={`text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-2 ${alignRight ? "text-right" : "text-left"}`}>
        {label}
      </div>
      <div className="flex-1 flex flex-col justify-around gap-1.5">
        {matches.map((m, i) => (
          <BracketMatch key={m?.matchId ?? `ph-${label}-${i}`} match={m} dense />
        ))}
      </div>
    </div>
  );
}

function FinalColumn({ match, centerHint }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-2">
      <div className="text-[10px] uppercase tracking-widest font-semibold text-amber-300/80 mb-3">
        Final
      </div>
      <div className="w-full">
        <BracketMatch match={match} dense large />
      </div>
      <div className="mt-3 text-[10px] text-slate-500 text-center px-1">
        {centerHint}
      </div>
    </div>
  );
}

function formatN(n) {
  return n.toLocaleString();
}

export default function BracketView() {
  const { state } = useTournament();
  const phase = state.phase;
  const simMode = state.simMode ?? 1;

  const r32 = splitHalves(state.bracket.R32, 16);
  const r16 = splitHalves(state.bracket.R16, 8);
  const qf = splitHalves(state.bracket.QF, 4);
  const sf = splitHalves(state.bracket.SF, 2);
  const finalMatch = state.bracket.F?.[0] ?? null;

  let centerHint = "Awaiting Semi-Final winners";
  if (phase === "knockouts_ready") centerHint = "Click \"Play Knockouts\" above to begin";
  else if (phase === "sf_done") centerHint = "Click \"Play the Final\" above";

  return (
    <section className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-3 flex-shrink-0 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Knockout Bracket</h2>
          <p className="text-xs text-slate-400">Round of 32 · 16 · Quarter-Finals · Semi-Finals · Final</p>
        </div>
        {simMode > 1 && (
          <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-300/90 bg-indigo-500/10 border border-indigo-500/30 rounded px-2 py-1">
            Bracket from {formatN(simMode)} simulations
          </span>
        )}
      </div>

      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        {/* LEFT half */}
        <Column label="R32" matches={r32.left} />
        <Column label="R16" matches={r16.left} />
        <Column label="QF" matches={qf.left} />
        <Column label="SF" matches={sf.left} />

        {/* CENTER */}
        <FinalColumn match={finalMatch} centerHint={centerHint} />

        {/* RIGHT half (mirrored labels) */}
        <Column label="SF" matches={sf.right} alignRight />
        <Column label="QF" matches={qf.right} alignRight />
        <Column label="R16" matches={r16.right} alignRight />
        <Column label="R32" matches={r32.right} alignRight />
      </div>
    </section>
  );
}
