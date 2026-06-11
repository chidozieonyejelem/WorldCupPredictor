import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTournament } from "../../hooks/useTournament.js";
import { getTeamById } from "../../data/teams.js";
import { flagEmoji } from "../../utils/flagEmoji.js";
import { cn } from "../../utils/classnames.js";
import MatchRow from "./MatchRow.jsx";

function positionStyle(pos, qualifiedThirds) {
  if (pos === 1 || pos === 2) return "text-emerald-300";
  if (pos === 3) return qualifiedThirds ? "text-emerald-200" : "text-slate-300";
  return "text-slate-400";
}

export default function GroupCard({ letter }) {
  const { state } = useTournament();
  const table = state.groupTables[letter] || [];
  const matches = state.groupMatches.filter((m) => m.group === letter);
  const allPlayed = matches.every((m) => m.played);

  const qualifiedThirdIds = new Set(
    state.thirdPlaceRanking.filter((r) => r.qualifiedAsThird).map((r) => r.teamId)
  );

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold tracking-wide">
          Group <span className="text-emerald-400">{letter}</span>
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          {matches.filter((m) => m.played).length}/{matches.length}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-500 text-left">
            <th className="pb-1 font-medium">#</th>
            <th className="pb-1 font-medium">Team</th>
            <th className="pb-1 font-medium text-center w-6">P</th>
            <th className="pb-1 font-medium text-center w-6">W</th>
            <th className="pb-1 font-medium text-center w-6">D</th>
            <th className="pb-1 font-medium text-center w-6">L</th>
            <th className="pb-1 font-medium text-center w-8">GD</th>
            <th className="pb-1 font-medium text-center w-8">Pts</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {table.map((row, idx) => {
              const team = getTeamById(row.teamId);
              const pos = idx + 1;
              const thirdQualified = qualifiedThirdIds.has(row.teamId);
              return (
                <motion.tr
                  key={row.teamId}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={cn(
                    "border-t border-slate-800/70",
                    allPlayed && pos <= 2 && "bg-emerald-500/5",
                    allPlayed && pos === 3 && thirdQualified && "bg-emerald-500/5",
                    allPlayed && pos === 4 && "bg-rose-500/5"
                  )}
                >
                  <td className={cn("py-1.5 font-mono text-xs", positionStyle(pos, thirdQualified))}>{pos}</td>
                  <td className="py-1.5 truncate max-w-[140px]">
                    <span className="mr-1.5">{flagEmoji(team.code, team.id)}</span>
                    <span className="font-medium">{team.name}</span>
                  </td>
                  <td className="py-1.5 text-center text-slate-400 text-xs">{row.played}</td>
                  <td className="py-1.5 text-center text-slate-300 text-xs">{row.won}</td>
                  <td className="py-1.5 text-center text-slate-400 text-xs">{row.drawn}</td>
                  <td className="py-1.5 text-center text-slate-400 text-xs">{row.lost}</td>
                  <td className="py-1.5 text-center text-slate-300 text-xs">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td className="py-1.5 text-center font-bold text-slate-100">{row.points}</td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>

      <div className="mt-3 pt-3 border-t border-slate-800/70 space-y-1">
        {matches.map((m) => (
          <MatchRow key={m.matchId} match={m} />
        ))}
      </div>
    </div>
  );
}
