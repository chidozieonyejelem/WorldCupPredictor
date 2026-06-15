import React from "react";
import { motion } from "framer-motion";
import { useTournament } from "../../hooks/useTournament.js";
import { getTeamById } from "../../data/teams.js";
import { flagEmoji } from "../../utils/flagEmoji.js";
import { cn } from "../../utils/classnames.js";

export default function ThirdPlaceTable() {
  const { state } = useTournament();
  const ranking = state.thirdPlaceRanking;
  if (!ranking.length) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-24 bottom-4 w-[320px] z-20 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-5 overflow-y-auto hidden xl:block"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold">Third-Place Ranking</h3>
        <p className="text-xs text-slate-400">Top 8 advance to the Round of 32</p>
      </div>

      <ol className="space-y-1.5">
        {ranking.map((row, idx) => {
          const team = getTeamById(row.teamId);
          const qualified = row.qualifiedAsThird;
          return (
            <motion.li
              key={row.teamId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center justify-between gap-2 px-3 py-2 rounded-md border",
                qualified
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-slate-800 bg-slate-950/50"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-slate-400 w-5">{idx + 1}</span>
                <span>{flagEmoji(team.code, team.id)}</span>
                <span className="truncate text-sm">{team.name}</span>
                <span className="text-[10px] text-slate-500 ml-1">({team.group})</span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                  qualified ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
                )}
              >
                {qualified ? "Qualified" : "Out"}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </motion.aside>
  );
}
