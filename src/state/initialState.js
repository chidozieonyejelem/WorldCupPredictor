import { TEAMS, GROUPS } from "../data/teams.js";
import { generateGroupSchedule } from "../engine/groupStandings.js";

function buildScheduledGroupMatches() {
  const matches = [];
  for (const letter of GROUPS) {
    const schedule = generateGroupSchedule(letter, TEAMS);
    schedule.forEach((m, idx) => {
      matches.push({
        ...m,
        matchId: `G${letter}-${idx + 1}`,
        played: false,
        goalsA: null,
        goalsB: null,
        winner: null,
        decidedBy: null,
      });
    });
  }
  return matches;
}

export function makeInitialState(runId = 0, simMode = 1) {
  return {
    runId,
    simMode,
    phase: "idle",
    speed: 1,
    teams: TEAMS,
    groupMatches: buildScheduledGroupMatches(),
    groupTables: GROUPS.reduce((acc, letter) => {
      acc[letter] = TEAMS.filter((t) => t.group === letter).map((t, i) => ({
        teamId: t.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
        position: i + 1,
      }));
      return acc;
    }, {}),
    thirdPlaceRanking: [],
    bracket: {
      R32: [],
      R16: [],
      QF: [],
      SF: [],
      F: [],
      TP: [],
    },
    finalStandings: [],
    revealThirdPlace: false,
    monteCarloProgress: null,
    monteCarloResults: null,
  };
}

export const initialState = makeInitialState();
