import { simulateMatch } from "./matchSimulator.js";
import { generateGroupSchedule, computeGroupTable } from "./groupStandings.js";
import { rankThirdPlacedTeams } from "./thirdPlaceRanking.js";
import { buildR32, buildNextRound, buildSingleMatch } from "./bracketBuilder.js";
import { computeFinalStandings } from "./finalStandings.js";
import { GROUPS, getTeamById } from "../data/teams.js";

function playRound(matches, knockout) {
  return matches.map((m) => {
    const tA = getTeamById(m.teamA);
    const tB = getTeamById(m.teamB);
    const result = simulateMatch(tA, tB, { knockout });
    return { ...m, ...result, played: true };
  });
}

function hydrate(shell, prev) {
  return shell.map((m, i) => ({
    ...m,
    teamA: prev[i * 2].winner,
    teamB: prev[i * 2 + 1].winner,
    teamAId: prev[i * 2].winner,
    teamBId: prev[i * 2 + 1].winner,
  }));
}

// Run a full tournament silently and return the 48-team final standings array.
export function runOneTournament(teams) {
  const groupMatches = [];
  let mid = 0;
  for (const letter of GROUPS) {
    const schedule = generateGroupSchedule(letter, teams);
    for (const m of schedule) {
      const tA = getTeamById(m.teamA);
      const tB = getTeamById(m.teamB);
      const result = simulateMatch(tA, tB, { knockout: false });
      groupMatches.push({ ...m, ...result, played: true, matchId: `g${mid++}` });
    }
  }

  const groupTables = {};
  for (const letter of GROUPS) {
    groupTables[letter] = computeGroupTable(letter, groupMatches, teams);
  }

  const thirdPlaceRanking = rankThirdPlacedTeams(groupTables);

  const r32 = playRound(buildR32(groupTables, thirdPlaceRanking), true);
  const r16 = playRound(hydrate(buildNextRound(r32, "R16"), r32), true);
  const qf = playRound(hydrate(buildNextRound(r16, "QF"), r16), true);
  const sf = playRound(hydrate(buildNextRound(qf, "SF"), qf), true);

  const finalMatches = playRound(buildSingleMatch("F", sf[0].winner, sf[1].winner), true);

  const sfLoserA = sf[0].winner === sf[0].teamA ? sf[0].teamB : sf[0].teamA;
  const sfLoserB = sf[1].winner === sf[1].teamA ? sf[1].teamB : sf[1].teamA;
  const tpMatches = playRound(buildSingleMatch("TP", sfLoserA, sfLoserB), true);

  const fakeState = {
    bracket: { R32: r32, R16: r16, QF: qf, SF: sf, F: finalMatches, TP: tpMatches },
    groupTables,
    thirdPlaceRanking,
  };
  const standings = computeFinalStandings(fakeState);
  return { standings, groupTables, thirdPlaceRanking };
}
