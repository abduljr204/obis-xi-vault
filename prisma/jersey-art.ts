// Generates the sample jersey artwork used by the demo products.
// Replace these with real product photos from the admin area at any time.

export type Pattern = "solid" | "stripes" | "hoops" | "sash" | "halves" | "pinstripes" | "chevron" | "panels";

export type JerseySpec = {
  kind: "football" | "basketball";
  base: string;
  accent: string;
  trim: string;
  text: string;
  pattern: Pattern;
  number: string;
  wordmark?: string;
};

const W = 800;
const H = 1000;

const FOOTBALL =
  "M330,182 Q400,232 470,182 L592,214 L708,336 L644,404 L586,356 L592,806 Q400,830 208,806 L214,356 L156,404 L92,336 L208,214 Z";
const BASKETBALL =
  "M332,170 Q400,262 468,170 L526,176 Q540,312 616,370 L606,808 Q400,832 194,808 L184,370 Q260,312 274,176 Z";

function patternLayer(s: JerseySpec) {
  const { accent, pattern } = s;
  switch (pattern) {
    case "stripes":
      return Array.from({ length: 7 }, (_, i) => `<rect x="${130 + i * 90}" y="120" width="45" height="760" fill="${accent}"/>`).join("");
    case "pinstripes":
      return Array.from({ length: 22 }, (_, i) => `<rect x="${110 + i * 28}" y="120" width="4" height="760" fill="${accent}" opacity=".8"/>`).join("");
    case "hoops":
      return Array.from({ length: 6 }, (_, i) => `<rect x="60" y="${250 + i * 110}" width="700" height="55" fill="${accent}"/>`).join("");
    case "sash":
      return `<polygon points="200,180 330,180 640,820 510,820" fill="${accent}"/>`;
    case "halves":
      return `<rect x="400" y="120" width="400" height="760" fill="${accent}"/>`;
    case "chevron":
      return `<polygon points="190,300 400,470 610,300 610,390 400,560 190,390" fill="${accent}"/>`;
    case "panels":
      return `<rect x="150" y="120" width="95" height="760" fill="${accent}"/><rect x="555" y="120" width="95" height="760" fill="${accent}"/>`;
    default:
      return "";
  }
}

function crest(x: number, y: number, s: JerseySpec) {
  return `<g transform="translate(${x},${y})">
    <path d="M0,-34 L30,-24 L28,10 Q22,32 0,42 Q-22,32 -28,10 L-30,-24 Z" fill="${s.trim}" stroke="${s.text}" stroke-width="3"/>
    <path d="M0,-14 L4,-3 L15,0 L4,3 L0,14 L-4,3 L-15,0 L-4,-3 Z" fill="${s.text}"/>
  </g>`;
}

function trim(s: JerseySpec) {
  if (s.kind === "football") {
    return `<path d="M330,182 Q400,232 470,182" fill="none" stroke="${s.trim}" stroke-width="16" stroke-linecap="round"/>
      <path d="M708,336 L644,404" stroke="${s.trim}" stroke-width="16"/>
      <path d="M92,336 L156,404" stroke="${s.trim}" stroke-width="16"/>`;
  }
  return `<path d="M332,170 Q400,262 468,170" fill="none" stroke="${s.trim}" stroke-width="16"/>
    <path d="M526,176 Q540,312 616,370" fill="none" stroke="${s.trim}" stroke-width="14"/>
    <path d="M274,176 Q260,312 184,370" fill="none" stroke="${s.trim}" stroke-width="14"/>`;
}

function shell(s: JerseySpec, body: string, id: string) {
  const shape = s.kind === "football" ? FOOTBALL : BASKETBALL;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg-${id}" cx="50%" cy="42%" r="70%">
      <stop offset="0" stop-color="#1d1d1d"/><stop offset="1" stop-color="#050505"/>
    </radialGradient>
    <linearGradient id="shade-${id}" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".35"/>
      <stop offset=".22" stop-color="#000" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".07"/>
      <stop offset=".78" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".35"/>
    </linearGradient>
    <clipPath id="clip-${id}"><path d="${shape}"/></clipPath>
    <filter id="drop-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#000" flood-opacity=".7"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg-${id})"/>
  <ellipse cx="400" cy="860" rx="250" ry="22" fill="#000" opacity=".6"/>
  <g filter="url(#drop-${id})">
    <path d="${shape}" fill="${s.base}"/>
    <g clip-path="url(#clip-${id})">
      ${patternLayer(s)}
      ${body}
      <rect width="${W}" height="${H}" fill="url(#shade-${id})"/>
    </g>
    ${trim(s)}
    <path d="${shape}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3"/>
  </g>
  <text x="400" y="955" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" letter-spacing="8" fill="#6f6c66">OBI'S XI VAULT</text>
</svg>`;
}

const NUM_FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

export function jerseyFront(s: JerseySpec, id: string) {
  const body =
    s.kind === "football"
      ? `${crest(500, 330, s)}
         <text x="300" y="342" font-family="${SERIF}" font-size="26" font-weight="700" fill="${s.text}" letter-spacing="2">✦ XI</text>
         ${s.wordmark ? `<text x="400" y="520" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="58" letter-spacing="10" fill="${s.text}">${s.wordmark}</text>` : ""}`
      : `<text x="400" y="395" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="62" letter-spacing="6" fill="${s.text}">${s.wordmark ?? "VAULT"}</text>
         <text x="400" y="590" text-anchor="middle" font-family="${NUM_FONT}" font-weight="900" font-size="190" fill="${s.text}" stroke="${s.trim}" stroke-width="6" paint-order="stroke">${s.number}</text>`;
  return shell(s, body, `${id}-f`);
}

export function jerseyBack(s: JerseySpec, id: string) {
  const top = s.kind === "football" ? 330 : 300;
  const body = `<text x="400" y="${top}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="54" letter-spacing="12" fill="${s.text}">OBI</text>
    <text x="400" y="${top + 260}" text-anchor="middle" font-family="${NUM_FONT}" font-weight="900" font-size="250" fill="${s.text}" stroke="${s.trim}" stroke-width="6" paint-order="stroke">${s.number}</text>`;
  // mirror the shape so the back reads as a back view (neckline higher)
  return shell(s, body, `${id}-b`);
}
