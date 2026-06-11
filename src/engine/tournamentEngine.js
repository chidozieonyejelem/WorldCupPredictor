import { simulateMatch } from "./matchSimulator.js";
import { getTeamById } from "../data/teams.js";

function delayFor(speed) {
  if (speed === "instant") return 0;
  const base = 400;
  return base / speed;
}

function sleep(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateGroupMatchSequence(scheduled, dispatch, getSpeed, isCancelled) {
  for (const match of scheduled) {
    if (isCancelled()) return;
    const teamA = getTeamById(match.teamA);
    const teamB = getTeamById(match.teamB);
    const result = simulateMatch(teamA, teamB, { knockout: false });
    const completed = { ...match, ...result };
    dispatch({ type: "RECORD_GROUP_MATCH", payload: completed });
    await sleep(delayFor(getSpeed()));
  }
}

// `pickWinner(teamA, teamB) => teamId | null` lets batch mode force the aggregate-most-likely
// winner per match while still using lambda-based scoring for realistic scorelines.
export async function simulateKnockoutRound(matches, dispatch, getSpeed, isCancelled, { knockout = true, pickWinner = null } = {}) {
  const completed = [];
  for (const match of matches) {
    if (isCancelled()) return completed;
    const teamA = getTeamById(match.teamA);
    const teamB = getTeamById(match.teamB);
    const winnerOverride = pickWinner ? pickWinner(teamA, teamB) : null;
    const result = simulateMatch(teamA, teamB, { knockout, winnerOverride });
    const finished = { ...match, ...result, played: true };
    dispatch({ type: "RECORD_KNOCKOUT_MATCH", payload: { round: match.round, match: finished } });
    completed.push(finished);
    await sleep(delayFor(getSpeed()));
  }
  return completed;
}

export function simulateMatchSilent(match, winnerOverride = null) {
  const teamA = getTeamById(match.teamA);
  const teamB = getTeamById(match.teamB);
  const result = simulateMatch(teamA, teamB, { knockout: true, winnerOverride });
  return { ...match, ...result, played: true };
}
