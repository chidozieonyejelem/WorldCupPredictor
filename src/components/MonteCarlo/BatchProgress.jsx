import React from "react";
import { motion } from "framer-motion";
import { useTournament } from "../../hooks/useTournament.js";

function formatN(n) {
  return n.toLocaleString();
}

export default function BatchProgress() {
  const { state } = useTournament();
  const total = state.simMode ?? 1;
  const current = state.monteCarloProgress?.current ?? 0;
  const pct = Math.min(100, Math.round((current / Math.max(1, total)) * 100));

  return (
    <section className="max-w-2xl mx-auto mt-12 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-6xl mb-6 inline-block"
      >
        ⚽
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">Running {formatN(total)} Full Tournaments</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
        Each simulation plays all 72 group matches and every knockout. When the batch finishes,
        the visual bracket will be seeded from the most frequent qualifiers and every match will
        be decided by the aggregate-most-likely winner.
      </p>

      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-mono text-3xl font-bold text-indigo-300">{formatN(current)}</span>
          <span className="text-sm text-slate-400">of {formatN(total)}</span>
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

      {total >= 100000 && (
        <p className="text-xs text-amber-300/80 mt-6">
          Heads up — large batches can take a minute or more.
        </p>
      )}
    </section>
  );
}
