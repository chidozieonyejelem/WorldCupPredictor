import React from "react";
import BracketMatch from "./BracketMatch.jsx";

export default function RoundColumn({ roundKey, label, matches, compact = false }) {
  const list = matches || [];
  const expectedCount = expectedMatchCount(roundKey);
  const placeholders = Math.max(0, expectedCount - list.length);

  return (
    <div className="flex-1 min-w-[180px] flex flex-col">
      {label && (
        <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-3 text-center">
          {label}
        </h3>
      )}
      <div
        className={
          compact
            ? "flex justify-center"
            : "flex-1 flex flex-col justify-around gap-3"
        }
      >
        {list.map((m) => (
          <BracketMatch key={m.matchId} match={m} compact={compact} />
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <BracketMatch key={`p-${roundKey}-${i}`} match={null} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function expectedMatchCount(roundKey) {
  switch (roundKey) {
    case "R32": return 16;
    case "R16": return 8;
    case "QF": return 4;
    case "SF": return 2;
    case "F": return 1;
    case "TP": return 1;
    default: return 0;
  }
}
