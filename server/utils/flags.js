const flagMap = {
  OK: "🇨🇿",
  OM: "🇸🇰",
  D: "🇩🇪",
  SP: "🇵🇱",
  OE: "🇦🇹",
  HA: "🇭🇺",
  PH: "🇳🇱",
  OO: "🇧🇪",
  F: "🇫🇷",
  G: "🇬🇧",
  EI: "🇮🇪",
  I: "🇮🇹",
  EC: "🇪🇸",
  CS: "🇵🇹",
  HB: "🇨🇭",
  LN: "🇳🇴",
  SE: "🇸🇪",
  OY: "🇩🇰",
  OH: "🇫🇮",
  TC: "🇹🇷",
  "9H": "🇲🇹",
  YR: "🇷🇴",
  LZ: "🇧🇬",
  SX: "🇬🇷",
  UR: "🇺🇦",
  N: "🇺🇸",
  C: "🇨🇦",
  B: "🇨🇳",
  A6: "🇦🇪",
  A7: "🇶🇦",
  "9V": "🇸🇬",
  HL: "🇰🇷",
  JA: "🇯🇵",
  VH: "🇦🇺",
  ZK: "🇳🇿",
  PT: "🇧🇷",
};

export function getFlag(reg) {
  if (!reg) return "";

  const normalizedReg = reg.trim().toUpperCase();

  // Registrations using the standard prefix format, e.g. CS-ABC
  const registrationPrefix = normalizedReg.split("-")[0];

  if (flagMap[registrationPrefix]) {
    return flagMap[registrationPrefix];
  }

  // Fallback for registrations without a hyphen, e.g. N12345.
  // Check longer prefixes first so CS is matched before C.
  const prefixes = Object.keys(flagMap).sort((a, b) => b.length - a.length);

  for (const prefix of prefixes) {
    if (!normalizedReg.includes("-") && normalizedReg.startsWith(prefix)) {
      return flagMap[prefix];
    }
  }

  return "🏳️";
}
