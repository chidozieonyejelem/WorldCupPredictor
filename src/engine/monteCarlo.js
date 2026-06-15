import { TEAMS, GROUPS } from "../data/teams.js";
import { runOneTournament } from "./headlessTournament.js";

function emptyStats() {
  const stats = {};
  for (const team of TEAMS) {
    stats[team.id] = {
      teamId: team.id,
      group: team.group,
      runs: 0,
      // Group placement counts
      pos1: 0, pos2: 0, pos3: 0, pos4: 0,
      qualifiedAsThird: 0,
      // Final-standings counts
      championships: 0,
      finalsReached: 0,
      semisReached: 0,
      quarterFinalsReached: 0,
      r16Reached: 0,
      knockoutsReached: 0,
      // Accumulators (averages)
      positionSum: 0,
      pointsSum: 0, gfSum: 0, gaSum: 0, gdSum: 0,
      wonSum: 0, drawnSum: 0, lostSum: 0,
    };
  }
  return stats;
}

// Runs N full tournaments and aggregates each team's outcomes — used to drive both
// the seeded bracket and the forced winners in batch-mode visual knockouts.
export async function runBatchTournaments(n, onProgress, isCancelled) {
  const stats = emptyStats();
  const yieldEvery = Math.max(1, Math.floor(n / 100));

  for (let i = 0; i < n; i++) {
    if (isCancelled?.()) return null;
    const { standings, groupTables, thirdPlaceRanking } = runOneTournament(TEAMS);

    // Group-stage placements
    for (const letter of GROUPS) {
      const table = groupTables[letter];
      for (let idx = 0; idx < table.length; idx++) {
        const row = table[idx];
        const s = stats[row.teamId];
        s.pointsSum += row.points;
        s.gfSum += row.gf;
        s.gaSum += row.ga;
        s.gdSum += row.gd;
        s.wonSum += row.won;
        s.drawnSum += row.drawn;
        s.lostSum += row.lost;
        const pos = idx + 1;
        if (pos === 1) s.pos1++;
        else if (pos === 2) s.pos2++;
        else if (pos === 3) s.pos3++;
        else if (pos === 4) s.pos4++;
      }
    }
    for (const row of thirdPlaceRanking) {
      if (row.qualifiedAsThird) stats[row.teamId].qualifiedAsThird++;
    }

    // Final standings (positions 1-48)
    for (const row of standings) {
      const s = stats[row.teamId];
      s.runs++;
      s.positionSum += row.position;
      if (row.position === 1) s.championships++;
      if (row.position <= 2) s.finalsReached++;
      if (row.position <= 4) s.semisReached++;
      if (row.position <= 8) s.quarterFinalsReached++;
      if (row.position <= 16) s.r16Reached++;
      if (row.position <= 32) s.knockoutsReached++;
    }

    if ((i + 1) % yieldEvery === 0 || i === n - 1) {
      onProgress?.(i + 1, n);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // Derived metric used to pick winners in batch-mode visual knockouts.
  for (const id in stats) {
    const s = stats[id];
    s.avgPosition = s.runs > 0 ? s.positionSum / s.runs : 49;
    s.championshipPct = s.runs > 0 ? (s.championships / s.runs) * 100 : 0;
  }

  return stats;
}

export function buildAggregateBracketInputs(stats) {
  const groupTables = {};
  for (const letter of GROUPS) {
    const groupTeams = TEAMS.filter((t) => t.group === letter);
    const teamStats = groupTeams.map((t) => stats[t.id]);

    teamStats.sort((a, b) => {
      const eA = a.runs > 0 ? (a.pos1 + 2 * a.pos2 + 3 * a.pos3 + 4 * a.pos4) / a.runs : 5;
      const eB = b.runs > 0 ? (b.pos1 + 2 * b.pos2 + 3 * b.pos3 + 4 * b.pos4) / b.runs : 5;
      if (eA !== eB) return eA - eB;
      const ppA = a.runs > 0 ? a.pointsSum / a.runs : 0;
      const ppB = b.runs > 0 ? b.pointsSum / b.runs : 0;
      return ppB - ppA;
    });

    groupTables[letter] = teamStats.map((s, idx) => {
      const r = Math.max(1, s.runs);
      return {
        teamId: s.teamId,
        played: 3,
        won: s.wonSum / r,
        drawn: s.drawnSum / r,
        lost: s.lostSum / r,
        gf: s.gfSum / r,
        ga: s.gaSum / r,
        gd: s.gdSum / r,
        points: s.pointsSum / r,
        position: idx + 1,
      };
    });
  }

  const thirds = GROUPS.map((letter) => {
    const row = groupTables[letter].find((r) => r.position === 3);
    return { ...row, qualifiedAsThirdCount: stats[row.teamId].qualifiedAsThird };
  });
  thirds.sort((a, b) => b.qualifiedAsThirdCount - a.qualifiedAsThirdCount);

  const thirdPlaceRanking = thirds.map((row, idx) => ({
    ...row,
    thirdRank: idx + 1,
    qualifiedAsThird: idx < 8,
  }));

  return { groupTables, thirdPlaceRanking };
}

// Given the batch stats, pick the team most likely to advance from a knockout match.
// Comparison cascade: championships → finals → semis → QF → R16 → KO → avgPosition.
// Returns null if neither team has any batch presence (shouldn't happen in normal flow).
export function pickAggregateWinner(stats, teamAId, teamBId) {
  const a = stats?.[teamAId];
  const b = stats?.[teamBId];
  if (!a || !b) return null;
  const keys = [
    "championships",
    "finalsReached",
    "semisReached",
    "quarterFinalsReached",
    "r16Reached",
    "knockoutsReached",
  ];
  for (const k of keys) {
    if (a[k] !== b[k]) return a[k] > b[k] ? teamAId : teamBId;
  }
  if (a.avgPosition !== b.avgPosition) return a.avgPosition < b.avgPosition ? teamAId : teamBId;
  return null;
}
