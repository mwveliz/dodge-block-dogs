const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist/itchio');
const sourceHtml = path.join(rootDir, 'index.html');
const destHtml = path.join(distDir, 'index.html');
const zipFile = path.join(distDir, 'dodge-block-dogs-itchio.zip');

console.log('Packaging for Itch.io...');

// Ensure dist/itchio directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy self-contained index.html
fs.copyFileSync(sourceHtml, destHtml);
console.log('Copied standalone index.html to dist/itchio/index.html (' + fs.statSync(destHtml).size + ' bytes)');

// Remove old zip if present
if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
}

// Generate ZIP package
try {
    execSync(`cd "${distDir}" && zip -9 -q "dodge-block-dogs-itchio.zip" index.html`, { stdio: 'inherit' });
    console.log('ZIP package created successfully: ' + zipFile);
    console.log('ZIP package size: ' + fs.statSync(zipFile).size + ' bytes');

    // Also copy to root for direct web download
    const rootZip = path.join(rootDir, 'dodge-block-dogs-itchio.zip');
    fs.copyFileSync(zipFile, rootZip);
    console.log('Copied root package: ' + rootZip);
} catch (e) {
    console.error('Failed to create zip:', e.message);
}

// Write Itch.io setup guide
const guidePath = path.join(distDir, 'ITCHIO_SETTINGS.md');
const guideContent = `# 🎮 Itch.io Upload & Game Settings Guide for Dodge Block Dogs

## 1. How to Upload
1. Log in to your itch.io account and click **Create new project**.
2. Set **Classification** to: **Games**.
3. Set **Kind of project** to: **HTML** (You have a ZIP file of HTML5 game).
4. In the **Uploads** section:
   - Click **Upload files** and select \`dist/itchio/dodge-block-dogs-itchio.zip\`.
   - Check the checkbox: **This file will be played in the browser**.

## 2. Recommended Embed Settings
- **Viewport dimensions**: \`420\` px wide by \`740\` px high (or \`460\` x \`820\` px).
- **Mobile friendly**: Check **Yes** (Enable touch and orientation support).
- **Automatically start on page load**: Check **Yes**.
- **Fullscreen button**: Check **Yes** (Allows players on PC/Mac/Linux to expand into fullscreen).

## 3. Features Included in this Build
- **100% Self-Contained**: 0 external server dependencies, Three.js 3D engine and Web Audio synth inlined.
- **Cross-Platform**: Runs in all desktop browsers (Chrome, Firefox, Safari, Edge) and mobile browsers.
- **Zero Microtransactions**: All bones and care items are 100% free through gameplay.
- **Bilingual & Multi-Language**: Spanish, English, Japanese, and Portuguese.
- **Retro 1996 LCD Mode**: One-click toggle in top header.
`;

fs.writeFileSync(guidePath, guideContent, 'utf8');
console.log('Wrote Itch.io deployment guide: ' + guidePath);
