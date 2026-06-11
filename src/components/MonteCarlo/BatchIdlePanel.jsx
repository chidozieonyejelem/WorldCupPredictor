import React from "react";
import { useTournament } from "../../hooks/useTournament.js";

function formatN(n) {
  return n.toLocaleString();
}

export default function BatchIdlePanel() {
  const { state } = useTournament();
  const total = state.simMode ?? 1;

  return (
    <section className="max-w-2xl mx-auto mt-16 text-center">
      <div className="text-6xl mb-6">📊</div>
      <h2 className="text-3xl font-bold mb-3">{formatN(total)}-Tournament Batch Mode</h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
        The simulator will silently play {formatN(total)} full tournaments and aggregate every
        team's results. The visual bracket is seeded from the most frequent qualifiers, and each
        knockout match is decided by the team most likely to advance across the batch — so the
        displayed champion is the team that actually won the most.
      </p>

      <div className="bg-slate-900/60 border border-indigo-500/30 rounded-lg p-5 text-left text-sm text-slate-300 space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-indigo-400 mt-0.5">1.</span>
          <span>Click <span className="font-semibold text-indigo-300">Run {formatN(total)} Simulations</span> in the top bar.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-indigo-400 mt-0.5">2.</span>
          <span>Watch the progress bar — large batches can take a moment.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-indigo-400 mt-0.5">3.</span>
          <span>Review the aggregate-derived Round of 32 bracket.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-indigo-400 mt-0.5">4.</span>
          <span>Click <span className="font-semibold text-emerald-300">Play Knockouts</span> to watch the bracket play out.</span>
        </div>
      </div>
    </section>
  );
}
