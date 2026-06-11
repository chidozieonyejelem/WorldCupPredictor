// Unicode tag characters (E0020–E007F) are used to render subdivision flags
// like England (gbeng) and Scotland (gbsct) — black flag + tag-letters + cancel tag.
function subdivisionFlag(subdivision) {
  const TAG_BASE = 0xe0000;
  const CANCEL = 0xe007f;
  const BLACK_FLAG = 0x1f3f4;
  const tags = [...subdivision.toLowerCase()]
    .map((c) => String.fromCodePoint(TAG_BASE + c.charCodeAt(0)))
    .join("");
  return String.fromCodePoint(BLACK_FLAG) + tags + String.fromCodePoint(CANCEL);
}

const SPECIAL = {
  ENG: subdivisionFlag("gbeng"),
  SCO: subdivisionFlag("gbsct"),
};

export function flagEmoji(code, teamId) {
  if (teamId && SPECIAL[teamId]) return SPECIAL[teamId];
  if (!code) return "🏳️";

  const upper = code.toUpperCase();
  if (upper.length !== 2) return "🏳️";

  const offset = 0x1f1e6 - 0x41;
  const chars = [...upper].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset));
  return chars.join("");
}
