import { GROUPS } from "../data/teams.js";

// ── Official FIFA World Cup 2026 Round of 32 ────────────────────────────────
// Source: FIFA 2026 knockout bracket (matches 73–88). The 24 group winners /
// runners-up have fixed pairings; eight group winners instead host one of the
// eight best third-placed teams. Which third goes where depends on *which* eight
// of the twelve groups qualified a third — FIFA's Annex C combination table.
//
// Official R32 matchups (match number → pairing):
//   73: 2A v 2B      77: 1I v 3rd        81: 1D v 3rd      85: 1B v 3rd
//   74: 1E v 3rd     78: 2E v 2I         82: 1G v 3rd      86: 1J v 2H
//   75: 1F v 2C      79: 1A v 3rd        83: 2K v 2L       87: 1K v 3rd
//   76: 1C v 2F      80: 1L v 3rd        84: 1H v 2J       88: 2D v 2G
//
// Official feed into later rounds:
//   R16: 89=W74/W77 90=W73/W75 91=W76/W78 92=W79/W80
//        93=W83/W84 94=W81/W82 95=W86/W88 96=W85/W87
//   QF: 97=W89/W90 98=W93/W94 99=W91/W92 100=W95/W96
//   SF: 101=W97/W98 102=W99/W100   Final: 104=W101/W102
//
// We emit the 16 R32 matches in *bracket-leaf order* so that the generic
// consecutive-pairing in buildNextRound (matches 2i, 2i+1 → next round) and the
// index-based hydration in the cascade reproduce that exact official feed.

// Each third-hosting match and the groups whose third-placed team it can draw.
// (Lists exclude the host winner's own group, so no same-group rematch is possible.)
const THIRD_SLOTS = [
  { id: "s74", groups: ["A", "B", "C", "D", "F"] }, // Winner E
  { id: "s77", groups: ["C", "D", "F", "G", "H"] }, // Winner I
  { id: "s79", groups: ["C", "E", "F", "H", "I"] }, // Winner A
  { id: "s80", groups: ["E", "H", "I", "J", "K"] }, // Winner L
  { id: "s81", groups: ["B", "E", "F", "I", "J"] }, // Winner D
  { id: "s82", groups: ["A", "E", "H", "I", "J"] }, // Winner G
  { id: "s85", groups: ["E", "F", "G", "I", "J"] }, // Winner B
  { id: "s87", groups: ["D", "E", "I", "J", "L"] }, // Winner K
];

// Assign each of the eight qualifying third-place groups to a hosting slot,
// respecting the eligibility lists above. The lists guarantee at least one valid
// perfect matching for any set of eight groups; backtracking finds one
// deterministically. Returns { slotId: groupLetter }.
function assignThirdGroups(qualifyingGroups) {
  const qualifying = new Set(qualifyingGroups);
  const assignment = {};
  const used = new Set();

  const solve = (i) => {
    if (i === THIRD_SLOTS.length) return used.size === qualifying.size;
    const slot = THIRD_SLOTS[i];
    for (const g of slot.groups) {
      if (!qualifying.has(g) || used.has(g)) continue;
      assignment[slot.id] = g;
      used.add(g);
      if (solve(i + 1)) return true;
      used.delete(g);
      delete assignment[slot.id];
    }
    return false;
  };

  if (!solve(0)) {
    // Defensive fallback (shouldn't happen with a valid 8-group set): fill any
    // unassigned slots with leftover groups so the bracket always builds.
    const leftover = qualifyingGroups.filter((g) => !Object.values(assignment).includes(g));
    for (const slot of THIRD_SLOTS) {
      if (!assignment[slot.id] && leftover.length) assignment[slot.id] = leftover.shift();
    }
  }
  return assignment;
}

export function buildR32(groupTables, thirdPlaceRanking) {
  const pos = (g, p) => groupTables[g].find((r) => r.position === p)?.teamId;
  const W = (g) => pos(g, 1);
  const R = (g) => pos(g, 2);

  // Which groups qualified a third-placed team, and each group's third.
  const qualifiedThirdIds = new Set(
    thirdPlaceRanking.filter((r) => r.qualifiedAsThird).map((r) => r.teamId)
  );
  const thirdTeamByGroup = {};
  const qualifyingGroups = [];
  for (const g of GROUPS) {
    const id = pos(g, 3);
    thirdTeamByGroup[g] = id;
    if (qualifiedThirdIds.has(id)) qualifyingGroups.push(g);
  }

  const slotGroup = assignThirdGroups(qualifyingGroups);
  const T = (slotId) => thirdTeamByGroup[slotGroup[slotId]];

  // Bracket-leaf order (see header). Comment marks the official match number.
  const pairs = [
    [W("E"), T("s74")], // 74
    [W("I"), T("s77")], // 77
    [R("A"), R("B")], //   73
    [W("F"), R("C")], //   75
    [R("K"), R("L")], //   83
    [W("H"), R("J")], //   84
    [W("D"), T("s81")], // 81
    [W("G"), T("s82")], // 82
    [W("C"), R("F")], //   76
    [R("E"), R("I")], //   78
    [W("A"), T("s79")], // 79
    [W("L"), T("s80")], // 80
    [W("J"), R("H")], //   86
    [R("D"), R("G")], //   88
    [W("B"), T("s85")], // 85
    [W("K"), T("s87")], // 87
  ];

  return pairs.map(([teamA, teamB], idx) => ({
    matchId: `R32-${idx + 1}`,
    round: "R32",
    slot: idx,
    teamA,
    teamB,
    teamAFrom: null,
    teamBFrom: null,
    teamAId: teamA,
    teamBId: teamB,
    played: false,
  }));
}

// Build next-round shell from current round's matches: pairs of consecutive matches.
export function buildNextRound(previousRound, nextRoundKey) {
  const matches = [];
  for (let i = 0; i < previousRound.length; i += 2) {
    const a = previousRound[i];
    const b = previousRound[i + 1];
    matches.push({
      matchId: `${nextRoundKey}-${matches.length + 1}`,
      round: nextRoundKey,
      slot: matches.length,
      teamA: null,
      teamB: null,
      teamAFrom: a.matchId,
      teamBFrom: b.matchId,
      teamAId: null,
      teamBId: null,
      played: false,
    });
  }
  return matches;
}

// Build a single-match round (Final or 3rd-place playoff) from a list of two seeds.
export function buildSingleMatch(roundKey, seedA, seedB, fromA = null, fromB = null) {
  return [
    {
      matchId: `${roundKey}-1`,
      round: roundKey,
      slot: 0,
      teamA: seedA,
      teamB: seedB,
      teamAFrom: fromA,
      teamBFrom: fromB,
      teamAId: seedA,
      teamBId: seedB,
      played: false,
    },
  ];
}
