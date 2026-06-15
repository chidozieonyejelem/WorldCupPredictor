// Rank all 12 third-placed teams; top 8 advance.
export function rankThirdPlacedTeams(groupTables) {
  const thirds = Object.values(groupTables)
    .map((table) => table.find((row) => row.position === 3))
    .filter(Boolean)
    .map((row) => ({ ...row }));

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return Math.random() - 0.5;
  });

  return thirds.map((row, idx) => ({
    ...row,
    thirdRank: idx + 1,
    qualifiedAsThird: idx < 8,
  }));
}
