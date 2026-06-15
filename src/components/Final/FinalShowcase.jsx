import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTournament } from "../../hooks/useTournament.js";
import { getTeamById } from "../../data/teams.js";
import { flagEmoji } from "../../utils/flagEmoji.js";
import { cn } from "../../utils/classnames.js";

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value == null) return;
    let raf;
    const start = performance.now();
    const duration = 600;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display}</span>;
}

function TeamCard({ team, score, penalties, isWinner, side }) {
  if (!team) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "flex-1 bg-slate-900/80 border rounded-xl p-6 text-center",
        isWinner ? "border-yellow-400/60 shadow-[0_0_40px_rgba(250,204,21,0.22)]" : "border-slate-700"
      )}
    >
      <div className="text-7xl mb-3">{flagEmoji(team.code, team.id)}</div>
      <div className={cn("text-2xl font-bold tracking-tight", isWinner && "text-yellow-300")}>
        {team.name}
      </div>
      <div className="text-xs text-slate-400 mt-1">Group {team.group}</div>
      <div className="mt-4 flex items-baseline justify-center gap-2 font-mono">
        <span className="text-6xl font-bold">
          {score == null ? "—" : <CountUp value={score} />}
        </span>
        {penalties != null && (
          <span className="text-2xl text-amber-300/90 font-semibold">({penalties})</span>
        )}
      </div>
    </motion.div>
  );
}

function ChampionBanner({ team }) {
  if (!team) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
      className="text-center mb-6"
    >
      <div className="text-xs uppercase tracking-[0.4em] text-amber-300/80 mb-2">World Champions</div>
      <div className="text-5xl lg:text-6xl font-extrabold tracking-tight text-yellow-300 flex items-center justify-center gap-3">
        <span>🏆</span>
        <span>{team.name}</span>
      </div>
    </motion.div>
  );
}

export default function FinalShowcase() {
  const { state } = useTournament();
  const finalMatch = state.bracket.F?.[0];
  const tpMatch = state.bracket.TP?.[0];
  if (!finalMatch) return null;

  const teamA = getTeamById(finalMatch.teamA);
  const teamB = getTeamById(finalMatch.teamB);
  const played = !!finalMatch.played;
  const winnerId = played ? finalMatch.winner : null;
  const champion = played ? getTeamById(winnerId) : null;

  return (
    <section>
      <AnimatePresence>
        {champion && state.phase === "complete" && <ChampionBanner team={champion} />}
      </AnimatePresence>

      <h2 className="text-center text-xs uppercase tracking-[0.4em] text-amber-300/80 mb-4">
        The Final
      </h2>
      <div className="flex items-stretch gap-4 max-w-4xl mx-auto">
        <TeamCard
          team={teamA}
          score={played ? finalMatch.goalsA : null}
          penalties={played ? finalMatch.penaltiesA : null}
          isWinner={played && winnerId === teamA.id}
          side="left"
        />
        <div className="flex items-center justify-center text-4xl font-bold text-slate-600">
          vs
        </div>
        <TeamCard
          team={teamB}
          score={played ? finalMatch.goalsB : null}
          penalties={played ? finalMatch.penaltiesB : null}
          isWinner={played && winnerId === teamB.id}
          side="right"
        />
      </div>

      {played && finalMatch.decidedBy !== "regulation" && (
        <p className="text-center text-xs uppercase tracking-widest text-amber-300/80 mt-3">
          Decided by {finalMatch.decidedBy === "penalties" ? "penalty shootout" : "extra time"}
        </p>
      )}

      <AnimatePresence>
        {state.revealThirdPlace && tpMatch?.played && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <h3 className="text-center text-[10px] uppercase tracking-[0.4em] text-amber-700/80 mb-3">
              Third-Place Playoff
            </h3>
            <div className="bg-slate-900/60 border border-amber-700/30 rounded-lg p-4">
              <ThirdPlaceLine match={tpMatch} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ThirdPlaceLine({ match }) {
  const teamA = getTeamById(match.teamA);
  const teamB = getTeamById(match.teamB);
  const winnerId = match.winner;
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        className={cn(
          "flex items-center gap-2 flex-1 min-w-0",
          winnerId === teamA.id ? "text-amber-200 font-semibold" : "text-slate-400"
        )}
      >
        <span className="text-2xl">{flagEmoji(teamA.code, teamA.id)}</span>
        <span className="truncate">{teamA.name}</span>
      </div>
      <span className="font-mono text-xl text-slate-200 flex items-baseline gap-1">
        <span>
          {match.goalsA}
          {match.penaltiesA != null && (
            <span className="text-xs text-amber-300/80 ml-0.5">({match.penaltiesA})</span>
          )}
        </span>
        <span>–</span>
        <span>
          {match.goalsB}
          {match.penaltiesB != null && (
            <span className="text-xs text-amber-300/80 ml-0.5">({match.penaltiesB})</span>
          )}
        </span>
      </span>
      <div
        className={cn(
          "flex items-center gap-2 flex-1 min-w-0 justify-end",
          winnerId === teamB.id ? "text-amber-200 font-semibold" : "text-slate-400"
        )}
      >
        <span className="truncate">{teamB.name}</span>
        <span className="text-2xl">{flagEmoji(teamB.code, teamB.id)}</span>
      </div>
    </div>
  );
}
