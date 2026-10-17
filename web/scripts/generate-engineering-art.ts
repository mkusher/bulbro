import sharp from "sharp";

// Code-native vector artwork rasterized for the existing item atlas.
const art: Record<string, string> = {
 garden: '<rect x="14" y="42" width="100" height="69" rx="12" fill="#94613c"/><path d="M35 93V40M64 93V24M93 93V40" stroke="#5f873e" stroke-width="8"/><path d="M35 62Q6 58 19 39Q39 39 35 62M64 47Q86 41 82 21Q59 23 64 47M93 67Q117 63 111 43Q88 46 93 67" fill="#92b958"/>',
 landmines: '<ellipse cx="64" cy="81" rx="49" ry="24" fill="#4f6142"/><ellipse cx="64" cy="65" rx="44" ry="25" fill="#90a16d"/><ellipse cx="64" cy="58" rx="28" ry="15" fill="#43513b"/><circle cx="64" cy="51" r="9" fill="#ed6850"/>',
 pencil: '<path d="M22 105L29 78L91 16L112 37L50 99Z" fill="#e8bd56"/><path d="M29 78L50 99L22 105Z" fill="#e6d5ad"/><path d="M22 105L26 94L34 102Z" fill="#303c38"/><path d="M88 19L109 40L115 34Q119 27 105 14Q100 10 96 12Z" fill="#cd7667"/>',
 toolbox: '<rect x="15" y="44" width="98" height="65" rx="8" fill="#bd6047"/><path d="M44 44V24H84V44" fill="none" stroke="#444f45" stroke-width="12"/><path d="M16 65H112" stroke="#793e34" stroke-width="7"/><rect x="57" y="57" width="14" height="23" rx="3" fill="#dfc985"/>',
 cog: '<path d="M53 13H75L79 28L91 34L105 31L116 50L105 60V73L116 83L105 102L91 99L79 105L75 119H53L49 105L37 99L23 102L12 83L23 73V60L12 50L23 31L37 34L49 28Z" fill="#9ba7a1"/><circle cx="64" cy="66" r="25" fill="#54645a"/><circle cx="64" cy="66" r="13" fill="#d1d6bd"/>',
};
for (const [id, color, symbol] of [
 ["turret", "#91a571", ""], ["medicalTurret", "#e3eadc", '<path d="M48 64H80M64 48V80" stroke="#cf4f48" stroke-width="10"/>'],
 ["laserTurret", "#b190d6", '<path d="M83 45L110 25" stroke="#e0b4ff" stroke-width="7"/>'],
 ["explosiveTurret", "#c98259", '<circle cx="95" cy="39" r="9" fill="#f7bb50"/>'],
 ["incendiaryTurret", "#dfad51", '<path d="M97 42Q81 26 100 13Q96 26 112 27Q120 44 104 49Z" fill="#ee8241"/>'],
]) art[id!] = `<path d="M41 85L20 112M87 85L108 112" stroke="#3e4c41" stroke-width="12"/><rect x="27" y="49" width="74" height="47" rx="13" fill="${color}"/><path d="M67 57L98 27L113 42L83 73Z" fill="#5e7062"/>${symbol}`;
for (const [id, body] of Object.entries(art)) {
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><g stroke="#28352d" stroke-width="4" stroke-linejoin="round">${body}</g></svg>`;
 await sharp(Buffer.from(svg)).png().toFile(new URL(`../src/assets/items/${id}.png`, import.meta.url).pathname);
}
