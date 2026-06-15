import { poissonRandom } from "./poisson.js";
import { computeStrength } from "./strength.js";

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Expected goals for `attacker` against `defender`. Uses the explicit attack/defense
// ratings, with a steeper-than-linear curve so big quality gaps produce more lopsided
// scorelines (cuts down on improbable upsets).
function expectedGoals(attacker, defender, { knockout = false } = {}) {
  const ATT_REF = 72;
  const DEF_REF = 72;
  const BASE = 1.35;

  const att = attacker.attack ?? 65;
  const def = defender.defense ?? 65;

  // Each ratio is raised to a power > 1 so quality gaps amplify rather than collapse.
  const attTerm = Math.pow(att / ATT_REF, 1.25);
  const defTerm = Math.pow(DEF_REF / def, 1.25);

  let lambda = BASE * attTerm * defTerm;

  // Form: narrow band around 1 so a hot/cold streak nudges the curve.
  const form = attacker.form ?? 0.6;
  lambda *= 0.92 + 0.16 * form;

  // Host nation: ~6% boost on attack output.
  if (attacker.home) lambda *= 1.06;
  // Defending against a host adds a bit of pressure on the visitor's defense.
  if (defender.home) lambda *= 1.02;

  // Knockout matches: experienced sides finish chances more reliably; inexperienced sides
  // freeze. The total swing is ±8% based on experience.
  if (knockout) {
    const exp = attacker.experience ?? 0.5;
    lambda *= 0.92 + 0.16 * exp;
  }

  return clamp(lambda, 0.12, 4.5);
}

function simulatePenaltyShootout(sA, sB) {
  const total = sA + sB;
  const probA = 0.72 + 0.12 * (sA / total);
  const probB = 0.72 + 0.12 * (sB / total);

  let scoreA = 0;
  let scoreB = 0;

  for (let i = 0; i < 5; i++) {
    if (Math.random() < probA) scoreA++;
    if (Math.random() < probB) scoreB++;
  }

  let safety = 0;
  while (scoreA === scoreB && safety < 25) {
    if (Math.random() < probA) scoreA++;
    if (Math.random() < probB) scoreB++;
    safety++;
  }

  if (scoreA === scoreB) {
    if (sA >= sB) scoreA++;
    else scoreB++;
  }

  return { scoreA, scoreB };
}

export function simulateMatch(teamA, teamB, { knockout = false, winnerOverride = null } = {}) {
  const lambdaA = expectedGoals(teamA, teamB, { knockout });
  const lambdaB = expectedGoals(teamB, teamA, { knockout });

  // When a winnerOverride is provided (batch mode forcing aggregate outcome),
  // sample goals from the same lambdas until the desired team wins. Capped retries
  // keep this fast even when the override goes against a heavy strength gap.
  if (winnerOverride) {
    let goalsA = 0;
    let goalsB = 0;
    let tries = 0;
    while (tries < 40) {
      goalsA = poissonRandom(lambdaA);
      goalsB = poissonRandom(lambdaB);
      if (winnerOverride === teamA.id && goalsA > goalsB) break;
      if (winnerOverride === teamB.id && goalsB > goalsA) break;
      tries++;
    }
    if (winnerOverride === teamA.id && goalsA <= goalsB) goalsA = goalsB + 1;
    if (winnerOverride === teamB.id && goalsB <= goalsA) goalsB = goalsA + 1;
    return {
      teamA: teamA.id,
      teamB: teamB.id,
      goalsA,
      goalsB,
      penaltiesA: null,
      penaltiesB: null,
      winner: winnerOverride,
      decidedBy: "regulation",
    };
  }

  let goalsA = poissonRandom(lambdaA);
  let goalsB = poissonRandom(lambdaB);

  let winner = null;
  let decidedBy = "regulation";
  let penaltiesA = null;
  let penaltiesB = null;

  if (knockout && goalsA === goalsB) {
    const etA = poissonRandom(lambdaA * 0.35);
    const etB = poissonRandom(lambdaB * 0.35);
    goalsA += etA;
    goalsB += etB;
    decidedBy = etA || etB ? "extra_time" : "regulation";

    if (goalsA === goalsB) {
      const sA = computeStrength(teamA);
      const sB = computeStrength(teamB);
      const pens = simulatePenaltyShootout(sA, sB);
      penaltiesA = pens.scoreA;
      penaltiesB = pens.scoreB;
      winner = pens.scoreA > pens.scoreB ? teamA.id : teamB.id;
      decidedBy = "penalties";
    }
  }

  if (winner === null) {
    if (goalsA > goalsB) winner = teamA.id;
    else if (goalsB > goalsA) winner = teamB.id;
  }

  return {
    teamA: teamA.id,
    teamB: teamB.id,
    goalsA,
    goalsB,
    penaltiesA,
    penaltiesB,
    winner,
    decidedBy,
  };
}
