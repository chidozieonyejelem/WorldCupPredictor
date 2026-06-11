import { getTeamsByGroup } from "../data/teams.js";

function emptyRow(teamId) {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    position: 0,
  };
}

function applyMatch(rowA, rowB, match) {
  rowA.played++;
  rowB.played++;
  rowA.gf += match.goalsA;
  rowA.ga += match.goalsB;
  rowB.gf += match.goalsB;
  rowB.ga += match.goalsA;
  rowA.gd = rowA.gf - rowA.ga;
  rowB.gd = rowB.gf - rowB.ga;

  if (match.winner === match.teamA) {
    rowA.won++;
    rowB.lost++;
    rowA.points += 3;
  } else if (match.winner === match.teamB) {
    rowB.won++;
    rowA.lost++;
    rowB.points += 3;
  } else {
    rowA.drawn++;
    rowB.drawn++;
    rowA.points += 1;
    rowB.points += 1;
  }
}

function headToHeadStats(tiedTeamIds, matches) {
  const tiedSet = new Set(tiedTeamIds);
  const h2h = {};
  for (const id of tiedTeamIds) h2h[id] = emptyRow(id);

  for (const m of matches) {
    if (!tiedSet.has(m.teamA) || !tiedSet.has(m.teamB)) continue;
    applyMatch(h2h[m.teamA], h2h[m.teamB], m);
  }
  return h2h;
}

// Sort one group's rows (or a subset) using FIFA tiebreakers.
function sortStandings(rows, matches) {
  // Initial sort: points → GD → GS.
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return 0;
  });

  // Walk consecutive runs that share (points, gd, gf) and break ties via head-to-head, then random.
  const result = [];
  let i = 0;
  while (i < rows.length) {
    let j = i;
    while (
      j + 1 < rows.length &&
      rows[j + 1].points === rows[i].points &&
      rows[j + 1].gd === rows[i].gd &&
      rows[j + 1].gf === rows[i].gf
    ) {
      j++;
    }

    if (j === i) {
      result.push(rows[i]);
      i++;
      continue;
    }

    const tied = rows.slice(i, j + 1);
    const h2h = headToHeadStats(tied.map((r) => r.teamId), matches);
    tied.sort((a, b) => {
      const ha = h2h[a.teamId];
      const hb = h2h[b.teamId];
      if (hb.points !== ha.points) return hb.points - ha.points;
      if (hb.gd !== ha.gd) return hb.gd - ha.gd;
      if (hb.gf !== ha.gf) return hb.gf - ha.gf;
      return Math.random() - 0.5;
    });
    result.push(...tied);
    i = j + 1;
  }

  result.forEach((row, idx) => {
    row.position = idx + 1;
  });
  return result;
}

export function computeGroupTable(groupLetter, matches, teams) {
  const groupTeams = teams ? teams.filter((t) => t.group === groupLetter) : getTeamsByGroup(groupLetter);
  const rows = {};
  for (const t of groupTeams) rows[t.id] = emptyRow(t.id);

  const groupMatches = matches.filter((m) => m.group === groupLetter);
  for (const m of groupMatches) {
    if (!rows[m.teamA] || !rows[m.teamB]) continue;
    applyMatch(rows[m.teamA], rows[m.teamB], m);
  }

  const arr = Object.values(rows);
  return sortStandings(arr, groupMatches);
}

// Round-robin schedule for one group: 6 matches in standard order.
export function generateGroupSchedule(groupLetter, teams) {
  const [t1, t2, t3, t4] = teams.filter((t) => t.group === groupLetter);
  return [
    { group: groupLetter, teamA: t1.id, teamB: t2.id },
    { group: groupLetter, teamA: t3.id, teamB: t4.id },
    { group: groupLetter, teamA: t1.id, teamB: t3.id },
    { group: groupLetter, teamA: t2.id, teamB: t4.id },
    { group: groupLetter, teamA: t1.id, teamB: t4.id },
    { group: groupLetter, teamA: t2.id, teamB: t3.id },
  ];
}
