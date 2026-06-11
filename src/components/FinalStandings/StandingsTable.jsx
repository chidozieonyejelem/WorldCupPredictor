import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTournament } from "../../hooks/useTournament.js";
import { getTeamById } from "../../data/teams.js";
import { flagEmoji } from "../../utils/flagEmoji.js";
import { computeFinalStandings } from "../../engine/finalStandings.js";
import { cn } from "../../utils/classnames.js";

function rowTint(position) {
  if (position === 1) return "bg-yellow-500/10";
  if (position === 2) return "bg-slate-300/10";
  if (position === 3) return "bg-amber-700/10";
  return "";
}

// Aggregate-odds ranking cascade — mirrors pickAggregateWinner: titles, then deeper
// rounds reached, with average final position as the final tiebreaker.
const ODDS_KEYS = [
  "championships",
  "finalsReached",
  "semisReached",
  "quarterFinalsReached",
  "r16Reached",
  "knockoutsReached",
];

function compareByOdds(a, b, stats) {
  const sa = stats?.[a.teamId];
  const sb = stats?.[b.teamId];
  for (const k of ODDS_KEYS) {
    const diff = (sb?.[k] ?? 0) - (sa?.[k] ?? 0);
    if (diff !== 0) return diff;
  }
  return (sa?.avgPosition ?? 49) - (sb?.avgPosition ?? 49);
}

function Pct({ count, runs, accent = false }) {
  const value = runs > 0 ? (count / runs) * 100 : 0;
  return (
    <span className={cn("font-mono tabular-nums", accent ? "text-emerald-300 font-semibold" : "text-slate-300")}>
      {value.toFixed(1)}%
    </span>
  );
}

export default function StandingsTable() {
  const { state, dispatch } = useTournament();

  useEffect(() => {
    if (state.phase !== "complete") return;
    if (state.finalStandings.length) return;
    const standings = computeFinalStandings(state);
    dispatch({ type: "SET_FINAL_STANDINGS", payload: standings });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const standings = state.finalStandings;

  // In batch mode (>1x) we ran many tournaments; monteCarloResults holds per-team
  // stats including how many of those simulations each team won.
  const simMode = state.simMode ?? 1;
  const stats = state.monteCarloResults;
  const showTitles = simMode > 1 && stats;

  // Hooks must run unconditionally and before any early return.
  const [sortBy, setSortBy] = useState("placement");
  const rows = useMemo(() => {
    if (!showTitles || sortBy === "placement") return standings;
    return [...standings].sort((a, b) => compareByOdds(a, b, stats));
  }, [standings, sortBy, showTitles, stats]);

  if (!standings.length) return null;

  return (
    <section className={cn("mt-12 mx-auto", showTitles ? "max-w-6xl" : "max-w-3xl")}>
      <h2 className="text-xl font-bold mb-4 text-center">Final Standings</h2>
      {showTitles && (
        <>
          <p className="text-xs text-slate-400 text-center mb-3 -mt-2">
            Placement is one consensus bracket · the aggregate columns are odds across{" "}
            {simMode.toLocaleString()} simulations
          </p>
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/60 p-0.5 text-xs">
              {[
                ["placement", "Placement"],
                ["odds", "Win odds"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortBy(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-colors",
                    sortBy === key ? "bg-indigo-500/80 text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/60 text-[10px] uppercase tracking-widest text-slate-400">
            <tr>
              <th className="py-2 px-3 text-left w-12">#</th>
              <th className="py-2 px-3 text-left">Team</th>
              <th className="py-2 px-3 text-left w-16">Group</th>
              <th className="py-2 px-3 text-left">Stage Reached</th>
              {showTitles && (
                <>
                  <th className="py-2 px-3 text-right w-20">Titles</th>
                  <th className="py-2 px-3 text-right">Win %</th>
                  <th className="py-2 px-3 text-right">Final %</th>
                  <th className="py-2 px-3 text-right">Semi %</th>
                  <th className="py-2 px-3 text-right">QF %</th>
                  <th className="py-2 px-3 text-right">R16 %</th>
                  <th className="py-2 px-3 text-right">KO %</th>
                  <th className="py-2 px-3 text-right">Avg Pos</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const team = getTeamById(row.teamId);
              const s = stats?.[row.teamId];
              const championships = s?.championships ?? 0;
              const runs = s?.runs ?? 0;
              return (
                <motion.tr
                  key={row.teamId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.015, 0.6) }}
                  className={cn("border-t border-slate-800/60", rowTint(row.position))}
                >
                  <td className="py-1.5 px-3 font-mono text-slate-400">
                    {row.position}
                    {row.position === 1 && <span className="ml-1">🏆</span>}
                  </td>
                  <td className="py-1.5 px-3">
                    <span className="mr-2">{flagEmoji(team.code, team.id)}</span>
                    <span className="font-medium">{team.name}</span>
                  </td>
                  <td className="py-1.5 px-3 text-slate-400">{team.group}</td>
                  <td className="py-1.5 px-3 text-slate-300">{row.stage}</td>
                  {showTitles && (
                    <>
                      <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                        <span className={cn(championships > 0 ? "text-yellow-300 font-semibold" : "text-slate-600")}>
                          {championships > 0 && <span className="mr-1">🏆</span>}
                          {championships}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <Pct count={championships} runs={runs} accent={runs > 0 && championships / runs >= 0.05} />
                      </td>
                      <td className="py-1.5 px-3 text-right"><Pct count={s?.finalsReached ?? 0} runs={runs} /></td>
                      <td className="py-1.5 px-3 text-right"><Pct count={s?.semisReached ?? 0} runs={runs} /></td>
                      <td className="py-1.5 px-3 text-right"><Pct count={s?.quarterFinalsReached ?? 0} runs={runs} /></td>
                      <td className="py-1.5 px-3 text-right"><Pct count={s?.r16Reached ?? 0} runs={runs} /></td>
                      <td className="py-1.5 px-3 text-right"><Pct count={s?.knockoutsReached ?? 0} runs={runs} /></td>
                      <td className="py-1.5 px-3 text-right font-mono tabular-nums text-slate-400">
                        {s?.avgPosition != null ? s.avgPosition.toFixed(1) : "—"}
                      </td>
                    </>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
