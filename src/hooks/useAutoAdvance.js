import { useEffect, useRef } from "react";
import { useTournament } from "./useTournament.js";
import {
  simulateGroupMatchSequence,
  simulateKnockoutRound,
  simulateMatchSilent,
} from "../engine/tournamentEngine.js";
import { buildR32, buildNextRound, buildSingleMatch } from "../engine/bracketBuilder.js";
import { runBatchTournaments, buildAggregateBracketInputs, pickAggregateWinner } from "../engine/monteCarlo.js";

// Each cascade captures the current generation at start. If a Reset bumps the
// generation, the captured value no longer matches and the loop bails.
// runningRef guards against re-entry during the phase-change flurry inside one cascade.
export function useAutoAdvance() {
  const { state, dispatch, generationRef, speedRef } = useTournament();
  const phase = state.phase;

  const groupsRunningRef = useRef(false);
  const knockoutsRunningRef = useRef(false);
  const finalRunningRef = useRef(false);
  const monteCarloRunningRef = useRef(false);

  // Build the R32 bracket (teams only, no scores) the moment we enter the preview phase.
  useEffect(() => {
    if (phase !== "knockouts_ready") return;
    if (state.bracket.R32.length) return;
    const r32 = buildR32(state.groupTables, state.thirdPlaceRanking);
    dispatch({ type: "SET_ROUND_MATCHES", payload: { round: "R32", matches: r32 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // GROUP STAGE
  useEffect(() => {
    if (phase !== "groups_running" || groupsRunningRef.current) return;
    groupsRunningRef.current = true;
    const myGen = generationRef.current.value;
    const getSpeed = () => speedRef.current;
    const isCancelled = () => generationRef.current.value !== myGen;

    (async () => {
      try {
        const remaining = state.groupMatches.filter((m) => !m.played);
        await simulateGroupMatchSequence(remaining, dispatch, getSpeed, isCancelled);
        if (isCancelled()) return;
        dispatch({ type: "FINALIZE_GROUPS" });
        dispatch({ type: "SET_PHASE", payload: "groups_done" });
      } finally {
        groupsRunningRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // KNOCKOUT CASCADE: R32 → R16 → QF → SF → (silently TP) → sf_done
  useEffect(() => {
    if (phase !== "r32_running" || knockoutsRunningRef.current) return;
    knockoutsRunningRef.current = true;
    const myGen = generationRef.current.value;
    const getSpeed = () => speedRef.current;
    const isCancelled = () => generationRef.current.value !== myGen;

    // In batch mode, every visual knockout match is forced to the aggregate-most-likely winner.
    const aggregateStats = state.monteCarloResults;
    const pickWinner = aggregateStats
      ? (teamA, teamB) => pickAggregateWinner(aggregateStats, teamA.id, teamB.id)
      : null;
    const roundOpts = { pickWinner };

    (async () => {
      try {
        let r32 = state.bracket.R32;
        if (!r32.length) {
          r32 = buildR32(state.groupTables, state.thirdPlaceRanking);
          dispatch({ type: "SET_ROUND_MATCHES", payload: { round: "R32", matches: r32 } });
        }
        const completedR32 = await simulateKnockoutRound(r32, dispatch, getSpeed, isCancelled, roundOpts);
        if (isCancelled()) return;
        dispatch({ type: "SET_PHASE", payload: "r16_running" });

        const r16Shell = buildNextRound(completedR32, "R16");
        const r16Hydrated = r16Shell.map((m, i) => ({
          ...m,
          teamA: completedR32[i * 2].winner,
          teamB: completedR32[i * 2 + 1].winner,
          teamAId: completedR32[i * 2].winner,
          teamBId: completedR32[i * 2 + 1].winner,
        }));
        dispatch({ type: "SET_ROUND_MATCHES", payload: { round: "R16", matches: r16Hydrated } });
        const completedR16 = await simulateKnockoutRound(r16Hydrated, dispatch, getSpeed, isCancelled, roundOpts);
        if (isCancelled()) return;
        dispatch({ type: "SET_PHASE", payload: "qf_running" });

        const qfShell = buildNextRound(completedR16, "QF");
        const qfHydrated = qfShell.map((m, i) => ({
          ...m,
          teamA: completedR16[i * 2].winner,
          teamB: completedR16[i * 2 + 1].winner,
          teamAId: completedR16[i * 2].winner,
          teamBId: completedR16[i * 2 + 1].winner,
        }));
        dispatch({ type: "SET_ROUND_MATCHES", payload: { round: "QF", matches: qfHydrated } });
        const completedQF = await simulateKnockoutRound(qfHydrated, dispatch, getSpeed, isCancelled, roundOpts);
        if (isCancelled()) return;
        dispatch({ type: "SET_PHASE", payload: "sf_running" });

        const sfShell = buildNextRound(completedQF, "SF");
        const sfHydrated = sfShell.map((m, i) => ({
          ...m,
          teamA: completedQF[i * 2].winner,
          teamB: completedQF[i * 2 + 1].winner,
          teamAId: completedQF[i * 2].winner,
          teamBId: completedQF[i * 2 + 1].winner,
        }));
        dispatch({ type: "SET_ROUND_MATCHES", payload: { round: "SF", matches: sfHydrated } });
        const completedSF = await simulateKnockoutRound(sfHydrated, dispatch, getSpeed, isCancelled, roundOpts);
        if (isCancelled()) return;

        const sfLoserA = completedSF[0].winner === completedSF[0].teamA ? completedSF[0].teamB : completedSF[0].teamA;
        const sfLoserB = completedSF[1].winner === completedSF[1].teamA ? completedSF[1].teamB : completedSF[1].teamA;

        const finalMatches = buildSingleMatch("F", completedSF[0].winner, completedSF[1].winner, completedSF[0].matchId, completedSF[1].matchId);
        const tpMatches = buildSingleMatch("TP", sfLoserA, sfLoserB, completedSF[0].matchId, completedSF[1].matchId);
        dispatch({ type: "SET_ROUND_MATCHES", payload: { round: "F", matches: finalMatches } });

        const tpWinnerOverride = pickWinner ? pickWinner({ id: sfLoserA }, { id: sfLoserB }) : null;
        const tpResolved = simulateMatchSilent(tpMatches[0], tpWinnerOverride);
        dispatch({ type: "SET_ROUND_MATCHES", payload: { round: "TP", matches: [tpResolved] } });

        dispatch({ type: "SET_PHASE", payload: "sf_done" });
      } finally {
        knockoutsRunningRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // FINAL
  useEffect(() => {
    if (phase !== "final_running" || finalRunningRef.current) return;
    finalRunningRef.current = true;
    const myGen = generationRef.current.value;
    const getSpeed = () => speedRef.current;
    const isCancelled = () => generationRef.current.value !== myGen;

    const aggregateStats = state.monteCarloResults;
    const pickWinner = aggregateStats
      ? (teamA, teamB) => pickAggregateWinner(aggregateStats, teamA.id, teamB.id)
      : null;

    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 1500));
        if (isCancelled()) return;

        const finalMatch = state.bracket.F[0];
        await simulateKnockoutRound([finalMatch], dispatch, getSpeed, isCancelled, { pickWinner });
        if (isCancelled()) return;

        dispatch({ type: "REVEAL_THIRD_PLACE" });
        await new Promise((r) => setTimeout(r, 800));
        if (isCancelled()) return;

        dispatch({ type: "SET_PHASE", payload: "complete" });
      } finally {
        finalRunningRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // BATCH GROUP STAGES — silently runs N group stages, derives an aggregate bracket,
  // then transitions to knockouts_ready so the user plays the visual knockouts.
  useEffect(() => {
    if (phase !== "batch_running" || monteCarloRunningRef.current) return;
    monteCarloRunningRef.current = true;
    const myGen = generationRef.current.value;
    const isCancelled = () => generationRef.current.value !== myGen;
    const total = Math.max(1, state.simMode | 0);

    (async () => {
      try {
        dispatch({ type: "SET_MC_PROGRESS", payload: { current: 0, total } });
        const stats = await runBatchTournaments(
          total,
          (current, t) => {
            if (isCancelled()) return;
            dispatch({ type: "SET_MC_PROGRESS", payload: { current, total: t } });
          },
          isCancelled
        );
        if (isCancelled() || !stats) return;

        const { groupTables, thirdPlaceRanking } = buildAggregateBracketInputs(stats);
        dispatch({ type: "SET_GROUP_TABLES", payload: groupTables });
        dispatch({ type: "SET_THIRD_PLACE_RANKING", payload: thirdPlaceRanking });
        dispatch({ type: "SET_MC_RESULTS", payload: stats });
        dispatch({ type: "SET_PHASE", payload: "knockouts_ready" });
      } finally {
        monteCarloRunningRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Reset running guards once we're back at idle (after Reset bumps generation).
  useEffect(() => {
    if (phase === "idle") {
      groupsRunningRef.current = false;
      knockoutsRunningRef.current = false;
      finalRunningRef.current = false;
      monteCarloRunningRef.current = false;
    }
  }, [phase]);
}
