import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTournament } from "../hooks/useTournament.js";
import { cn } from "../utils/classnames.js";

const SPEED_OPTIONS = [
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "5x", value: 5 },
  { label: "Instant", value: "instant" },
];

const MODE_OPTIONS = [
  { label: "1× · Single", value: 1 },
  { label: "100×", value: 100 },
  { label: "1,000×", value: 1000 },
  { label: "10,000×", value: 10000 },
  { label: "100,000×", value: 100000 },
];

function ModeDropdown({ value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between gap-2 min-w-[110px] px-2.5 py-1.5 text-xs rounded-md",
          "bg-slate-900 border border-slate-700 text-slate-200",
          "hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-400",
          disabled && "opacity-50 cursor-not-allowed",
          value > 1 && "border-indigo-500/50 text-indigo-200"
        )}
      >
        <span>{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-slate-400">
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 z-40 min-w-[150px] bg-slate-900 border border-slate-700 rounded-md shadow-xl py-1"
          >
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2",
                      "hover:bg-slate-800",
                      selected ? "text-indigo-200 font-semibold" : "text-slate-200"
                    )}
                  >
                    <span className={cn("w-3 text-emerald-400", !selected && "opacity-0")}>✓</span>
                    <span>{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatN(n) {
  return n.toLocaleString();
}

function phaseLabel(state) {
  const played = state.groupMatches.filter((m) => m.played).length;
  const total = state.groupMatches.length;
  const simMode = state.simMode ?? 1;
  const batchTotal = simMode;

  switch (state.phase) {
    case "idle":
      if (simMode > 1) return `Ready to batch-simulate ${formatN(batchTotal)} tournaments`;
      return "Ready to kick off";
    case "groups_running":
      return `Group Stage — ${played} / ${total} matches played`;
    case "groups_done":
      return "Group Stage complete — review 3rd-place rankings";
    case "knockouts_ready":
      if (simMode > 1) return `Bracket built from ${formatN(batchTotal)} simulations — ready to play`;
      return "Round of 32 set — ready to kick off the knockouts";
    case "r32_running":
      return "Knockouts — Round of 32";
    case "r16_running":
      return "Knockouts — Round of 16";
    case "qf_running":
      return "Knockouts — Quarter-Finals";
    case "sf_running":
      return "Knockouts — Semi-Finals";
    case "sf_done":
      return "Semi-Finals complete — ready for the Final";
    case "final_running":
      return "The Final";
    case "complete":
      return "Tournament complete";
    case "batch_running": {
      const cur = state.monteCarloProgress?.current ?? 0;
      return `Running ${formatN(cur)} / ${formatN(batchTotal)} simulations…`;
    }
    default:
      return "";
  }
}

function primaryButtonConfig(state) {
  const { phase, simMode } = state;
  switch (phase) {
    case "idle":
      if (simMode > 1)
        return {
          label: `Run ${formatN(simMode)} Simulations`,
          nextPhase: "batch_running",
          batchStart: true,
          visible: true,
        };
      return { label: "Start Simulation", nextPhase: "groups_running", visible: true };
    case "groups_done":
      return { label: "Continue to Knockouts", nextPhase: "knockouts_ready", visible: true };
    case "knockouts_ready":
      return { label: "Play Knockouts", nextPhase: "r32_running", visible: true };
    case "sf_done":
      return { label: "Play the Final", nextPhase: "final_running", visible: true };
    case "complete":
      return { label: "Reset Tournament", nextPhase: null, reset: true, visible: true };
    default:
      return { label: null, visible: false };
  }
}

export default function ControlBar() {
  const { state, dispatch, generationRef } = useTournament();
  const [confirmReset, setConfirmReset] = useState(false);
  const primary = primaryButtonConfig(state);
  const simMode = state.simMode ?? 1;

  const canChangeMode = state.phase === "idle" || state.phase === "complete";
  const inSingleMode = simMode === 1;
  const showSpeedSelector = state.phase !== "batch_running" && state.phase !== "idle";
  const showSpeedAtIdle = state.phase === "idle" && inSingleMode;

  const onPrimary = () => {
    if (primary.reset) {
      generationRef.current.value++;
      dispatch({ type: "RESET" });
      return;
    }
    if (primary.nextPhase) {
      dispatch({ type: "SET_PHASE", payload: primary.nextPhase });
    }
  };

  const onResetRequest = () => setConfirmReset(true);
  const onResetConfirm = () => {
    generationRef.current.value++;
    dispatch({ type: "RESET" });
    setConfirmReset(false);
  };

  const onModeChange = (next) => {
    if (!canChangeMode) return;
    if (state.phase !== "idle") {
      generationRef.current.value++;
      dispatch({ type: "RESET" });
    }
    dispatch({ type: "SET_SIM_MODE", payload: next });
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-16 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🏆</span>
            <h1 className="text-lg font-semibold tracking-tight">WC 2026 Simulator</h1>
          </div>

          <div className="flex-1 text-center text-sm text-slate-300 font-medium hidden lg:block truncate">
            {phaseLabel(state)}
          </div>

          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 hidden md:inline">Mode</span>
            <ModeDropdown
              value={simMode}
              options={MODE_OPTIONS}
              onChange={onModeChange}
              disabled={!canChangeMode}
            />
          </div>

          {(showSpeedSelector || showSpeedAtIdle) && (
            <div className="hidden md:flex items-center gap-1 mr-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">Speed</span>
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => dispatch({ type: "SET_SPEED", payload: opt.value })}
                  className={cn(
                    "px-2 py-1 text-xs rounded-md transition-colors",
                    state.speed === opt.value
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {primary.visible && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onPrimary}
              className={cn(
                "px-4 py-2 rounded-md font-semibold text-sm shadow-lg transition-colors shrink-0",
                primary.reset
                  ? "bg-rose-500/90 hover:bg-rose-500 text-white"
                  : primary.batchStart
                  ? "bg-indigo-500 hover:bg-indigo-400 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              )}
            >
              {primary.label}
            </motion.button>
          )}

          {state.phase !== "idle" && state.phase !== "complete" && (
            <button
              onClick={onResetRequest}
              className="text-xs text-slate-400 hover:text-rose-300 underline-offset-4 hover:underline ml-1 shrink-0"
            >
              Reset
            </button>
          )}
        </div>

        {state.phase !== "idle" && (
          <div className="lg:hidden text-center text-xs text-slate-400 pb-2">
            {phaseLabel(state)}
          </div>
        )}
      </header>

      {confirmReset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm w-full"
          >
            <h2 className="text-lg font-semibold mb-2">Reset tournament?</h2>
            <p className="text-sm text-slate-400 mb-4">
              All current results will be cleared. The simulation will start fresh with the same teams and groups.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-sm rounded-md text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={onResetConfirm}
                className="px-3 py-1.5 text-sm rounded-md bg-rose-500 hover:bg-rose-400 text-white font-semibold"
              >
                Reset
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
