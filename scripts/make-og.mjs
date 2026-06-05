// Generate the social/OG card (1200x630) -> public/og.png
// Run: node scripts/make-og.mjs   (uses sharp, already a dependency)
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ember" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF5436"/><stop offset="1" stop-color="#FFAE3C"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="0%" r="70%">
      <stop offset="0" stop-color="#FF5436" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#FF5436" stop-opacity="0"/>
    </radialGradient>
    <style>
      .t { font-family: 'Space Grotesk','Helvetica Neue',Arial,sans-serif; }
      .b { font-family: 'Hanken Grotesk','Helvetica Neue',Arial,sans-serif; }
      .m { font-family: 'JetBrains Mono',ui-monospace,monospace; }
    </style>
  </defs>

  <rect width="1200" height="630" fill="#0b0d12"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g transform="translate(96,92) scale(2.1)">
    <path d="M7 22 L13 10 L19 18 L25 8" stroke="url(#ember)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="7" cy="22" r="2.8" fill="url(#ember)"/>
    <circle cx="19" cy="18" r="2.4" fill="url(#ember)"/>
    <circle cx="25" cy="8" r="2.8" fill="url(#ember)"/>
    <circle cx="13" cy="10" r="1.9" fill="#FFAE3C"/>
  </g>
  <text x="160" y="128" class="m" font-size="26" fill="#8d8b86" letter-spacing="3">UMP</text>

  <text x="96" y="300" class="t" font-size="92" font-weight="700" fill="#f7f5f2">Universal Memory</text>
  <text x="96" y="396" class="t" font-size="92" font-weight="700" fill="url(#ember)">Protocol</text>

  <text x="100" y="470" class="b" font-size="34" fill="#c4c2bd">The open memory layer for AI agents.</text>

  <text x="100" y="556" class="m" font-size="24" fill="#585954">MCP <tspan fill="#8d8b86">tools</tspan>     A2A <tspan fill="#8d8b86">coordination</tspan>     <tspan fill="#FF5436">UMP</tspan> <tspan fill="#c4c2bd">memory</tspan></text>
  <text x="1104" y="556" text-anchor="end" class="m" font-size="22" fill="#585954">universalmemoryprotocol.io</text>
</svg>`;

mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(new URL("../public/og.png", import.meta.url), png);
console.log("wrote public/og.png", png.length, "bytes");
