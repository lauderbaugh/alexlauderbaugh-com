#!/usr/bin/env node
// Generate /public/favicon.ico and /public/apple-touch-icon.png from the
// design tokens in lib/site.ts. Source of truth for the em-dash geometry is
// /public/favicon.svg; this script just rasterizes static-color variants.
//
// Run: pnpm gen:icons

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

const FOREST = "#2D4A3E";
const PAPER = "#FAFAF7";

// 32x32 favicon — transparent background, forest-green em-dash (light-mode color).
function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect x="5" y="14.5" width="22" height="3" rx="1.5" fill="${FOREST}"/>
</svg>`;
}

// 180x180 apple-touch-icon — paper background, forest-green em-dash.
// iOS ignores SVG color-scheme media queries, so we bake a fixed light-mode look.
function appleTouchIconSvg() {
  // Geometry scales: em-dash width = 180 * 22/32 = 123.75; height = 180 * 3/32 = 16.875
  // Round to chunky values that play well at the icon's actual display sizes.
  const W = 180;
  const H = 180;
  const dashWidth = 124;
  const dashHeight = 17;
  const x = (W - dashWidth) / 2;
  const y = (H - dashHeight) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="${x}" y="${y}" width="${dashWidth}" height="${dashHeight}" rx="${dashHeight / 2}" fill="${FOREST}"/>
</svg>`;
}

// Wrap a 32x32 PNG buffer in an ICO container.
// ICO format: 6-byte file header + 16-byte directory entry + raw PNG.
function pngToIco32(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type (1 = icon)
  header.writeUInt16LE(1, 4); // image count

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0);  // width (0 means 256+; 32 fits in one byte)
  dirEntry.writeUInt8(32, 1);  // height
  dirEntry.writeUInt8(0, 2);   // color palette (0 for non-palette)
  dirEntry.writeUInt8(0, 3);   // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(32, 6); // bits per pixel (32 = RGBA)
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // image data size
  dirEntry.writeUInt32LE(22, 12); // offset to image data (6 + 16)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

async function main() {
  // 1. apple-touch-icon.png — 180x180 with paper bg
  const apple = await sharp(Buffer.from(appleTouchIconSvg()))
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(PUBLIC, "apple-touch-icon.png"), apple);
  console.log(`✓ apple-touch-icon.png (${apple.length} bytes)`);

  // 2. favicon-32.png — intermediate for ICO wrapping
  const fav32 = await sharp(Buffer.from(faviconSvg()))
    .resize(32, 32)
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 3. favicon.ico — wrap the 32x32 PNG
  const ico = pngToIco32(fav32);
  await writeFile(join(PUBLIC, "favicon.ico"), ico);
  console.log(`✓ favicon.ico (${ico.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
