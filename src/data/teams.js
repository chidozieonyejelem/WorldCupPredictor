export const TEAMS = [
  // Group A
  { id: "MEX", name: "Mexico",        code: "MX", group: "A", pot: 1, fifaPoints: 1681, form: 0.62, confederation: "CONCACAF", attack: 70, defense: 68, experience: 0.55, home: true  },
  { id: "RSA", name: "South Africa",  code: "ZA", group: "A", pot: 3, fifaPoints: 1462, form: 0.70, confederation: "CAF",      attack: 56, defense: 58, experience: 0.25, home: false },
  { id: "KOR", name: "South Korea",   code: "KR", group: "A", pot: 2, fifaPoints: 1605, form: 0.58, confederation: "AFC",      attack: 68, defense: 64, experience: 0.50, home: false },
  { id: "CZE", name: "Czechia",       code: "CZ", group: "A", pot: 4, fifaPoints: 1430, form: 0.55, confederation: "UEFA",     attack: 60, defense: 64, experience: 0.40, home: false },

  // Group B
  { id: "CAN", name: "Canada",                   code: "CA", group: "B", pot: 1, fifaPoints: 1525, form: 0.60, confederation: "CONCACAF", attack: 65, defense: 64, experience: 0.22, home: true  },
  { id: "BIH", name: "Bosnia and Herzegovina",   code: "BA", group: "B", pot: 4, fifaPoints: 1380, form: 0.65, confederation: "UEFA",     attack: 60, defense: 58, experience: 0.30, home: false },
  { id: "QAT", name: "Qatar",                    code: "QA", group: "B", pot: 3, fifaPoints: 1395, form: 0.50, confederation: "AFC",      attack: 55, defense: 60, experience: 0.20, home: false },
  { id: "SUI", name: "Switzerland",              code: "CH", group: "B", pot: 2, fifaPoints: 1649, form: 0.65, confederation: "UEFA",     attack: 70, defense: 74, experience: 0.55, home: false },

  // Group C
  { id: "BRA", name: "Brazil",   code: "BR", group: "C", pot: 1, fifaPoints: 1761, form: 0.72, confederation: "CONMEBOL", attack: 89, defense: 80, experience: 0.95, home: false },
  { id: "MAR", name: "Morocco",  code: "MA", group: "C", pot: 2, fifaPoints: 1755, form: 0.78, confederation: "CAF",      attack: 76, defense: 80, experience: 0.65, home: false },
  { id: "HAI", name: "Haiti",    code: "HT", group: "C", pot: 4, fifaPoints: 1265, form: 0.55, confederation: "CONCACAF", attack: 50, defense: 50, experience: 0.20, home: false },
  { id: "SCO", name: "Scotland", code: "GB", group: "C", pot: 3, fifaPoints: 1415, form: 0.60, confederation: "UEFA",     attack: 62, defense: 60, experience: 0.30, home: false },

  // Group D
  { id: "USA", name: "United States", code: "US", group: "D", pot: 1, fifaPoints: 1673, form: 0.62, confederation: "CONCACAF", attack: 70, defense: 68, experience: 0.45, home: true  },
  { id: "PAR", name: "Paraguay",      code: "PY", group: "D", pot: 3, fifaPoints: 1450, form: 0.65, confederation: "CONMEBOL", attack: 60, defense: 64, experience: 0.42, home: false },
  { id: "AUS", name: "Australia",     code: "AU", group: "D", pot: 2, fifaPoints: 1530, form: 0.58, confederation: "AFC",      attack: 60, defense: 66, experience: 0.45, home: false },
  { id: "TUR", name: "Türkiye",       code: "TR", group: "D", pot: 4, fifaPoints: 1540, form: 0.68, confederation: "UEFA",     attack: 70, defense: 62, experience: 0.45, home: false },

  // Group E
  { id: "GER", name: "Germany",       code: "DE", group: "E", pot: 1, fifaPoints: 1730, form: 0.68, confederation: "UEFA",     attack: 82, defense: 78, experience: 0.88, home: false },
  { id: "CUW", name: "Curaçao",       code: "CW", group: "E", pot: 4, fifaPoints: 1275, form: 0.65, confederation: "CONCACAF", attack: 50, defense: 50, experience: 0.10, home: false },
  { id: "CIV", name: "Côte d'Ivoire", code: "CI", group: "E", pot: 3, fifaPoints: 1455, form: 0.70, confederation: "CAF",      attack: 68, defense: 65, experience: 0.45, home: false },
  { id: "ECU", name: "Ecuador",       code: "EC", group: "E", pot: 2, fifaPoints: 1545, form: 0.62, confederation: "CONMEBOL", attack: 64, defense: 68, experience: 0.45, home: false },

  // Group F
  { id: "NED", name: "Netherlands", code: "NL", group: "F", pot: 1, fifaPoints: 1757, form: 0.70, confederation: "UEFA", attack: 84, defense: 80, experience: 0.80, home: false },
  { id: "JPN", name: "Japan",       code: "JP", group: "F", pot: 2, fifaPoints: 1660, form: 0.72, confederation: "AFC",  attack: 72, defense: 74, experience: 0.55, home: false },
  { id: "SWE", name: "Sweden",      code: "SE", group: "F", pot: 4, fifaPoints: 1480, form: 0.60, confederation: "UEFA", attack: 64, defense: 62, experience: 0.45, home: false },
  { id: "TUN", name: "Tunisia",     code: "TN", group: "F", pot: 3, fifaPoints: 1395, form: 0.55, confederation: "CAF",  attack: 58, defense: 60, experience: 0.32, home: false },

  // Group G
  { id: "BEL", name: "Belgium",     code: "BE", group: "G", pot: 1, fifaPoints: 1734, form: 0.60, confederation: "UEFA", attack: 78, defense: 72, experience: 0.70, home: false },
  { id: "EGY", name: "Egypt",       code: "EG", group: "G", pot: 3, fifaPoints: 1485, form: 0.65, confederation: "CAF",  attack: 64, defense: 64, experience: 0.45, home: false },
  { id: "IRN", name: "Iran",        code: "IR", group: "G", pot: 2, fifaPoints: 1640, form: 0.58, confederation: "AFC",  attack: 66, defense: 70, experience: 0.50, home: false },
  { id: "NZL", name: "New Zealand", code: "NZ", group: "G", pot: 4, fifaPoints: 1245, form: 0.55, confederation: "OFC",  attack: 48, defense: 50, experience: 0.20, home: false },

  // Group H
  { id: "ESP", name: "Spain",        code: "ES", group: "H", pot: 1, fifaPoints: 1876, form: 0.82, confederation: "UEFA",     attack: 88, defense: 84, experience: 0.85, home: false },
  { id: "CPV", name: "Cape Verde",   code: "CV", group: "H", pot: 4, fifaPoints: 1290, form: 0.65, confederation: "CAF",      attack: 52, defense: 54, experience: 0.15, home: false },
  { id: "KSA", name: "Saudi Arabia", code: "SA", group: "H", pot: 3, fifaPoints: 1366, form: 0.52, confederation: "AFC",      attack: 56, defense: 60, experience: 0.32, home: false },
  { id: "URU", name: "Uruguay",      code: "UY", group: "H", pot: 2, fifaPoints: 1673, form: 0.65, confederation: "CONMEBOL", attack: 75, defense: 75, experience: 0.75, home: false },

  // Group I
  { id: "FRA", name: "France",  code: "FR", group: "I", pot: 1, fifaPoints: 1877, form: 0.80, confederation: "UEFA", attack: 90, defense: 85, experience: 0.92, home: false },
  { id: "SEN", name: "Senegal", code: "SN", group: "I", pot: 2, fifaPoints: 1688, form: 0.72, confederation: "CAF",  attack: 74, defense: 74, experience: 0.62, home: false },
  { id: "IRQ", name: "Iraq",    code: "IQ", group: "I", pot: 4, fifaPoints: 1370, form: 0.55, confederation: "AFC",  attack: 56, defense: 58, experience: 0.20, home: false },
  { id: "NOR", name: "Norway",  code: "NO", group: "I", pot: 3, fifaPoints: 1490, form: 0.75, confederation: "UEFA", attack: 76, defense: 64, experience: 0.40, home: false },

  // Group J
  { id: "ARG", name: "Argentina", code: "AR", group: "J", pot: 1, fifaPoints: 1874, form: 0.78, confederation: "CONMEBOL", attack: 89, defense: 80, experience: 0.92, home: false },
  { id: "ALG", name: "Algeria",   code: "DZ", group: "J", pot: 3, fifaPoints: 1452, form: 0.60, confederation: "CAF",      attack: 62, defense: 62, experience: 0.40, home: false },
  { id: "AUT", name: "Austria",   code: "AT", group: "J", pot: 2, fifaPoints: 1510, form: 0.65, confederation: "UEFA",     attack: 68, defense: 68, experience: 0.45, home: false },
  { id: "JOR", name: "Jordan",    code: "JO", group: "J", pot: 4, fifaPoints: 1340, form: 0.62, confederation: "AFC",      attack: 56, defense: 58, experience: 0.22, home: false },

  // Group K
  { id: "POR", name: "Portugal",   code: "PT", group: "K", pot: 1, fifaPoints: 1763, form: 0.72, confederation: "UEFA",     attack: 86, defense: 78, experience: 0.80, home: false },
  { id: "COD", name: "DR Congo",   code: "CD", group: "K", pot: 3, fifaPoints: 1370, form: 0.62, confederation: "CAF",      attack: 64, defense: 64, experience: 0.40, home: false },
  { id: "UZB", name: "Uzbekistan", code: "UZ", group: "K", pot: 4, fifaPoints: 1340, form: 0.60, confederation: "AFC",      attack: 58, defense: 60, experience: 0.20, home: false },
  { id: "COL", name: "Colombia",   code: "CO", group: "K", pot: 2, fifaPoints: 1693, form: 0.68, confederation: "CONMEBOL", attack: 78, defense: 72, experience: 0.65, home: false },

  // Group L
  { id: "ENG", name: "England", code: "GB", group: "L", pot: 1, fifaPoints: 1825, form: 0.75, confederation: "UEFA",     attack: 86, defense: 82, experience: 0.78, home: false },
  { id: "CRO", name: "Croatia", code: "HR", group: "L", pot: 2, fifaPoints: 1717, form: 0.62, confederation: "UEFA",     attack: 74, defense: 74, experience: 0.80, home: false },
  { id: "GHA", name: "Ghana",   code: "GH", group: "L", pot: 3, fifaPoints: 1295, form: 0.55, confederation: "CAF",      attack: 60, defense: 58, experience: 0.38, home: false },
  { id: "PAN", name: "Panama",  code: "PA", group: "L", pot: 4, fifaPoints: 1445, form: 0.62, confederation: "CONCACAF", attack: 58, defense: 60, experience: 0.30, home: false },
];

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const TEAMS_BY_ID = TEAMS.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

export function getTeamById(id) {
  return TEAMS_BY_ID[id];
}

export function getTeamsByGroup(letter) {
  return TEAMS.filter((t) => t.group === letter);
}
