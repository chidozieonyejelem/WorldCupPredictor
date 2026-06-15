// Overall strength is used for the penalty shootout coin-flip and for any place
// the simulator needs a single quality number. Match-level expected goals are
// computed directly from attack/defense — see matchSimulator.js.
export function computeStrength(team) {
  if (team.attack != null && team.defense != null) {
    const overall = (team.attack + team.defense) / 2 / 75;       // ≈ 0.55 - 1.13
    const formMult = 0.94 + 0.12 * (team.form ?? 0.6);            // ≈ 0.94 - 1.06
    const expMult = 0.96 + 0.08 * (team.experience ?? 0.5);       // ≈ 0.96 - 1.04
    const homeMult = team.home ? 1.05 : 1.0;
    return overall * formMult * expMult * homeMult;
  }
  // Legacy fallback for teams that haven't been upgraded with attack/defense.
  const base = team.fifaPoints / 2000;
  const formMult = 0.85 + 0.30 * team.form;
  return base * formMult;
}
