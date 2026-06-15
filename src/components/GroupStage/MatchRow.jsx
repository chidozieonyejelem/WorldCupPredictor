import React from "react";
import { motion } from "framer-motion";
import { getTeamById } from "../../data/teams.js";
import { flagEmoji } from "../../utils/flagEmoji.js";
import { cn } from "../../utils/classnames.js";

export default function MatchRow({ match }) {
  const teamA = getTeamById(match.teamA);
  const teamB = getTeamById(match.teamB);
  const played = match.played;
  const winnerId = played ? match.winner : null;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: played ? 1 : 0.7 }}
      className="flex items-center justify-between text-xs"
    >
      <span
        className={cn(
          "flex-1 truncate",
          played && winnerId === teamA.id && "text-emerald-300 font-semibold",
          played && winnerId === teamB.id && "text-slate-500"
        )}
      >
        {flagEmoji(teamA.code, teamA.id)} {teamA.name}
      </span>
      <span className="px-2 font-mono text-slate-300">
        {played ? `${match.goalsA} – ${match.goalsB}` : "— vs —"}
      </span>
      <span
        className={cn(
          "flex-1 truncate text-right",
          played && winnerId === teamB.id && "text-emerald-300 font-semibold",
          played && winnerId === teamA.id && "text-slate-500"
        )}
      >
        {teamB.name} {flagEmoji(teamB.code, teamB.id)}
      </span>
    </motion.div>
  );
}
