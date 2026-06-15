import React from "react";
import { motion } from "framer-motion";
import { getTeamById } from "../../data/teams.js";
import { flagEmoji } from "../../utils/flagEmoji.js";
import { cn } from "../../utils/classnames.js";

function TeamRow({ teamId, fromLabel, score, penalties, played, isWinner, isLoser, dense, large }) {
  const team = teamId ? getTeamById(teamId) : null;
  const nameSize = large ? "text-sm" : dense ? "text-[11px]" : "text-sm";
  const flagSize = large ? "text-lg" : dense ? "text-sm" : "text-base";
  const padY = dense ? "py-1" : "py-1.5";

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isLoser ? 0.45 : 1,
        scale: isWinner ? 1.01 : 1,
      }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex items-center justify-between gap-1 px-1.5",
        padY,
        isWinner && "border-l-2 border-emerald-400 bg-emerald-500/5",
        isLoser && "line-through decoration-rose-400/40"
      )}
    >
      <span className="flex items-center gap-1 min-w-0 flex-1">
        {team ? (
          <>
            <span className={cn("leading-none", flagSize)}>{flagEmoji(team.code, team.id)}</span>
            <span
              className={cn(
                "truncate",
                nameSize,
                isWinner ? "text-emerald-200 font-semibold" : "text-slate-300"
              )}
            >
              {team.name}
            </span>
          </>
        ) : (
          <span className={cn("text-slate-600 truncate", dense ? "text-[10px]" : "text-xs")}>
            {fromLabel || "TBD"}
          </span>
        )}
      </span>
      <span
        className={cn(
          "font-mono text-right tabular-nums flex items-baseline gap-0.5 justify-end shrink-0",
          isWinner ? "text-emerald-200 font-bold" : "text-slate-400"
        )}
      >
        {played && (
          <>
            <span className={dense ? "text-xs" : "text-sm"}>{score}</span>
            {penalties != null && (
              <span
                className={cn(
                  "text-amber-300/80",
                  dense ? "text-[9px]" : "text-[10px]"
                )}
              >
                ({penalties})
              </span>
            )}
          </>
        )}
      </span>
    </motion.div>
  );
}

export default function BracketMatch({ match, dense = false, large = false }) {
  if (!match) {
    return (
      <div
        className={cn(
          "border border-dashed border-slate-800 rounded text-center text-slate-600",
          dense ? "py-2 text-[9px]" : "py-3 text-[10px]"
        )}
      >
        TBD
      </div>
    );
  }

  const played = !!match.played;
  const winnerId = played ? match.winner : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded bg-slate-900/70 overflow-hidden",
        large ? "border-amber-400/40 shadow-lg shadow-amber-500/5" : "border-slate-800"
      )}
    >
      <TeamRow
        teamId={match.teamA}
        fromLabel={match.teamAFrom ? `W ${match.teamAFrom}` : null}
        score={match.goalsA}
        penalties={match.penaltiesA}
        played={played}
        isWinner={played && winnerId === match.teamA}
        isLoser={played && winnerId === match.teamB}
        dense={dense}
        large={large}
      />
      <div className="h-px bg-slate-800/80" />
      <TeamRow
        teamId={match.teamB}
        fromLabel={match.teamBFrom ? `W ${match.teamBFrom}` : null}
        score={match.goalsB}
        penalties={match.penaltiesB}
        played={played}
        isWinner={played && winnerId === match.teamB}
        isLoser={played && winnerId === match.teamA}
        dense={dense}
        large={large}
      />
      {played && match.decidedBy !== "regulation" && (
        <div
          className={cn(
            "uppercase tracking-widest text-amber-300/80 bg-slate-950/60 text-center",
            dense ? "px-1 text-[8px] py-0.5" : "px-2 text-[9px] py-0.5"
          )}
        >
          {match.decidedBy === "penalties" ? "Pens" : "ET"}
        </div>
      )}
    </motion.div>
  );
}
