import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTournament } from "../hooks/useTournament.js";
import { useAutoAdvance } from "../hooks/useAutoAdvance.js";
import ControlBar from "./ControlBar.jsx";
import GroupStageView from "./GroupStage/GroupStageView.jsx";
import ThirdPlaceTable from "./ThirdPlaceRanking/ThirdPlaceTable.jsx";
import BracketView from "./Knockouts/BracketView.jsx";
import FinalShowcase from "./Final/FinalShowcase.jsx";
import StandingsTable from "./FinalStandings/StandingsTable.jsx";
import BatchProgress from "./MonteCarlo/BatchProgress.jsx";
import BatchIdlePanel from "./MonteCarlo/BatchIdlePanel.jsx";

const GROUP_PHASES = ["groups_running", "groups_done"];
const BRACKET_PHASES = ["knockouts_ready", "r32_running", "r16_running", "qf_running", "sf_running", "sf_done"];
const FINAL_PHASES = ["final_running", "complete"];

function viewForPhase(phase, simMode) {
  if (phase === "batch_running") return "batch";
  if (phase === "idle") return simMode > 1 ? "batch_idle" : "groups";
  if (GROUP_PHASES.includes(phase)) return "groups";
  if (BRACKET_PHASES.includes(phase)) return "bracket";
  if (FINAL_PHASES.includes(phase)) return "final";
  return "groups";
}

export default function Dashboard() {
  const { state } = useTournament();
  useAutoAdvance();
  const view = viewForPhase(state.phase, state.simMode ?? 1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [state.phase, state.runId]);

  const keyFor = (v) => `${v}-${state.runId}`;

  return (
    <div className="min-h-screen w-full text-slate-100">
      <ControlBar />

      <main className="pt-20 pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {view === "groups" && (
            <motion.div key={keyFor("groups")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <GroupStageView />
            </motion.div>
          )}

          {view === "bracket" && (
            <motion.div key={keyFor("bracket")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <BracketView />
            </motion.div>
          )}

          {view === "final" && (
            <motion.div key={keyFor("final")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <FinalShowcase />
              {state.phase === "complete" && <StandingsTable />}
            </motion.div>
          )}

          {view === "batch_idle" && (
            <motion.div key={keyFor("batchidle")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <BatchIdlePanel />
            </motion.div>
          )}

          {view === "batch" && (
            <motion.div key={keyFor("batch")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <BatchProgress />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {state.phase === "groups_done" && <ThirdPlaceTable />}
      </AnimatePresence>
    </div>
  );
}
