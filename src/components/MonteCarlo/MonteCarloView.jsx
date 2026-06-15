import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTournament } from "../../hooks/useTournament.js";
import { getTeamById } from "../../data/teams.js";
import { flagEmoji } from "../../utils/flagEmoji.js";
import { cn } from "../../utils/classnames.js";

function MonteCarloProgress() {
  const { state } = useTournament();
  const total = state.simMode === "batch1000" ? 1000 : 100;
  const current = state.monteCarloProgress?.current ?? 0;
  const pct = Math.min(100, Math.round((current / total) * 100));

  return (
    <section className="max-w-2xl mx-auto mt-12 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-6xl mb-6 inline-block"
      >
        ⚽
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">Running {total} Tournaments</h2>
      <p className="text-slate-400 text-sm mb-8">
        Aggregating results across thousands of matches — this only takes a moment.
      </p>

      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-mono text-3xl font-bold text-indigo-300">{current}</span>
          <span className="text-sm text-slate-400">of {total}</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
          />
        </div>
        <div className="text-xs text-slate-500 mt-2 text-right font-mono">{pct}%</div>
      </div>
    </section>
  );
}

function Pct({ value, accent = false }) {
  const display = value.toFixed(1);
  return (
    <span className={cn("font-mono tabular-nums", accent ? "text-emerald-300 font-semibold" : "text-slate-300")}>
      {display}%
    </span>
  );
}

function ChampionBanner({ topRow, totalRuns }) {
  if (!topRow) return null;
  const team = getTeamById(topRow.teamId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8 bg-gradient-to-br from-yellow-500/15 via-amber-500/5 to-transparent border border-yellow-400/30 rounded-xl p-6 text-center"
    >
      <div className="text-[10px] uppercase tracking-[0.4em] text-amber-300/80 mb-2">
        Most Likely Champion · over {totalRuns} simulations
      </div>
      <div className="flex items-center justify-center gap-4 text-yellow-300">
        <span className="text-6xl leading-none">{flagEmoji(team.code, team.id)}</span>
        <div className="text-left">
          <div className="text-4xl font-extrabold tracking-tight">{team.name}</div>
          <div className="text-sm text-amber-300/80">
            {topRow.championships} titles · won {topRow.championshipPct.toFixed(1)}% of simulations
          </div>
        </div>
        <span className="text-5xl">🏆</span>
      </div>
    </motion.div>
  );
}

function rankTint(rank) {
  if (rank === 1) return "bg-yellow-500/10";
  if (rank === 2) return "bg-slate-300/10";
  if (rank === 3) return "bg-amber-700/10";
  return "";
}

function MonteCarloResults() {
  const { state } = useTournament();
  const results = state.monteCarloResults;
  const totalRuns = state.simMode === "batch1000" ? 1000 : 100;
  if (!results) return null;

  return (
    <section className="max-w-5xl mx-auto">
      <ChampionBanner topRow={results[0]} totalRuns={totalRuns} />

      <div className="mb-4 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Aggregate Standings</h2>
          <p className="text-xs text-slate-400">
            Sorted by titles · finals reached · semis reached · average position
          </p>
        </div>
        <div className="text-xs text-slate-500">{totalRuns} simulations</div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/60 text-[10px] uppercase tracking-widest text-slate-400">
            <tr>
              <th className="py-2 px-3 text-left w-10">#</th>
              <th className="py-2 px-3 text-left">Team</th>
              <th className="py-2 px-3 text-left w-14">Group</th>
              <th className="py-2 px-3 text-right">Win %</th>
              <th className="py-2 px-3 text-right">Final %</th>
              <th className="py-2 px-3 text-right">Semi %</th>
              <th className="py-2 px-3 text-right">QF %</th>
              <th className="py-2 px-3 text-right">R16 %</th>
              <th className="py-2 px-3 text-right">KO %</th>
              <th className="py-2 px-3 text-right">Avg Pos</th>
              <th className="py-2 px-3 text-right">Best</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => {
              const team = getTeamById(row.teamId);
              return (
                <motion.tr
                  key={row.teamId}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.4) }}
                  className={cn("border-t border-slate-800/60", rankTint(row.rank))}
                >
                  <td className="py-1.5 px-3 font-mono text-slate-400">
                    {row.rank}
                    {row.rank === 1 && <span className="ml-1">🏆</span>}
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className="mr-2">{flagEmoji(team.code, team.id)}</span>
                    <span className="font-medium">{team.name}</span>
                  </td>
                  <td className="py-1.5 px-3 text-slate-400">{team.group}</td>
                  <td className="py-1.5 px-3 text-right">
                    <Pct value={row.championshipPct} accent={row.championshipPct >= 5} />
                  </td>
                  <td className="py-1.5 px-3 text-right"><Pct value={row.finalsPct} /></td>
                  <td className="py-1.5 px-3 text-right"><Pct value={row.semisPct} /></td>
                  <td className="py-1.5 px-3 text-right"><Pct value={row.qfPct} /></td>
                  <td className="py-1.5 px-3 text-right"><Pct value={row.r16Pct} /></td>
                  <td className="py-1.5 px-3 text-right"><Pct value={row.koPct} /></td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums text-slate-300">
                    {row.avgPosition.toFixed(1)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums text-slate-500">
                    {row.bestPosition}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center">
        Win % is share of simulations where this team lifted the trophy. KO % is share where they
        made the Round of 32.
      </p>
    </section>
  );
}

export default function MonteCarloView() {
  const { state } = useTournament();

  return (
    <AnimatePresence mode="wait">
      {state.phase === "montecarlo_running" && (
        <motion.div key="mc-progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <MonteCarloProgress />
        </motion.div>
      )}
      {state.phase === "montecarlo_done" && (
        <motion.div key="mc-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <MonteCarloResults />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
