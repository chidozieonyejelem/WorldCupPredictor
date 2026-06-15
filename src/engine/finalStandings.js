import { getTeamById } from "../data/teams.js";

function loserOf(match) {
  if (!match || !match.played) return null;
  return match.winner === match.teamA ? match.teamB : match.teamA;
}

function teamLastMatch(teamId, bracket) {
  const rounds = ["F", "SF", "QF", "R16", "R32"];
  for (const round of rounds) {
    const list = bracket[round] || [];
    const match = list.find((m) => m.played && (m.teamA === teamId || m.teamB === teamId));
    if (match) return match;
  }
  return null;
}

function rankByLastMatchStats(teamIds, bracket) {
  const enriched = teamIds.map((id) => {
    const m = teamLastMatch(id, bracket);
    if (!m) return { teamId: id, points: 0, gf: 0 };
    const points = m.winner === id ? 3 : m.winner === null ? 1 : 0;
    const gf = m.teamA === id ? m.goalsA : m.goalsB;
    return { teamId: id, points, gf };
  });

  enriched.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return Math.random() - 0.5;
  });

  return enriched.map((e) => e.teamId);
}

function rankByGroupStats(teamIds, groupTables) {
  const rows = teamIds
    .map((id) => {
      const team = getTeamById(id);
      const table = groupTables[team.group];
      return table.find((r) => r.teamId === id);
    })
    .filter(Boolean);

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return Math.random() - 0.5;
  });

  return rows.map((r) => r.teamId);
}

export function computeFinalStandings(state) {
  const { bracket, groupTables, thirdPlaceRanking } = state;

  const finalMatch = bracket.F?.[0];
  const tpMatch = bracket.TP?.[0];

  const champion = finalMatch?.winner;
  const runnerUp = loserOf(finalMatch);
  const third = tpMatch?.winner;
  const fourth = loserOf(tpMatch);

  // QF losers (positions 5–8): the 4 losers of QF matches
  const qfLosers = (bracket.QF || [])
    .filter((m) => m.played)
    .map(loserOf)
    .filter(Boolean);

  // R16 losers (9–16)
  const r16Losers = (bracket.R16 || [])
    .filter((m) => m.played)
    .map(loserOf)
    .filter(Boolean);

  // R32 losers (17–32)
  const r32Losers = (bracket.R32 || [])
    .filter((m) => m.played)
    .map(loserOf)
    .filter(Boolean);

  // 4 non-qualifying 3rd-placed teams (33–36)
  const nonQualifiedThirds = thirdPlaceRanking
    .filter((r) => !r.qualifiedAsThird)
    .map((r) => r.teamId);

  // 12 group 4th-placed teams (37–48)
  const fourthPlaced = Object.values(groupTables)
    .map((table) => table.find((row) => row.position === 4)?.teamId)
    .filter(Boolean);

  const ranked = [];
  if (champion) ranked.push({ teamId: champion, stage: "Champion" });
  if (runnerUp) ranked.push({ teamId: runnerUp, stage: "Runner-up" });
  if (third) ranked.push({ teamId: third, stage: "Third place" });
  if (fourth) ranked.push({ teamId: fourth, stage: "Fourth place" });

  rankByLastMatchStats(qfLosers, bracket).forEach((id) =>
    ranked.push({ teamId: id, stage: "Quarter-finals" })
  );
  rankByLastMatchStats(r16Losers, bracket).forEach((id) =>
    ranked.push({ teamId: id, stage: "Round of 16" })
  );
  rankByLastMatchStats(r32Losers, bracket).forEach((id) =>
    ranked.push({ teamId: id, stage: "Round of 32" })
  );
  rankByGroupStats(nonQualifiedThirds, groupTables).forEach((id) =>
    ranked.push({ teamId: id, stage: "Group stage (3rd)" })
  );
  rankByGroupStats(fourthPlaced, groupTables).forEach((id) =>
    ranked.push({ teamId: id, stage: "Group stage (4th)" })
  );

  return ranked.map((entry, idx) => ({ ...entry, position: idx + 1 }));
}
