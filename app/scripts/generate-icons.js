#!/usr/bin/env node

/**
 * Generate PWA icons for 3RROR_K1NG
 * Run: node scripts/generate-icons.js
 *
 * This creates simple SVG icons that browsers can use.
 * For production, you may want to use a tool like pwa-asset-generator.
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');

// SVG template with 3RROR_K1NG branding
const createSvg = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00ff41;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00cc33;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#0a0a0b"/>
  <text
    x="50%"
    y="50%"
    font-family="monospace"
    font-size="${Math.round(size * 0.3)}"
    font-weight="bold"
    fill="url(#glow)"
    text-anchor="middle"
    dominant-baseline="central"
    style="text-shadow: 0 0 ${Math.round(size * 0.05)}px #00ff41;"
  >3K</text>
</svg>`;

// Sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Generate icons
sizes.forEach((size) => {
  const svg = createSvg(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(ICONS_DIR, filename);
  fs.writeFileSync(filepath, svg);
  console.log(`Generated: ${filename}`);
});

// Create maskable versions (same for now, but with padding)
const createMaskableSvg = (size) => {
  const padding = Math.round(size * 0.1);
  const innerSize = size - padding * 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0a0a0b"/>
  <text
    x="50%"
    y="50%"
    font-family="monospace"
    font-size="${Math.round(innerSize * 0.3)}"
    font-weight="bold"
    fill="#00ff41"
    text-anchor="middle"
    dominant-baseline="central"
  >3K</text>
</svg>`;
};

[192, 512].forEach((size) => {
  const svg = createMaskableSvg(size);
  const filename = `icon-maskable-${size}x${size}.svg`;
  const filepath = path.join(ICONS_DIR, filename);
  fs.writeFileSync(filepath, svg);
  console.log(`Generated: ${filename}`);
});

console.log('\\nDone! Icons generated in public/icons/');
console.log('Note: For production, convert these SVGs to PNG using a tool like sharp or pwa-asset-generator.');
