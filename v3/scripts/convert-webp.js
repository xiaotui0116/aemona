// scripts/convert-webp.js
// Converts PNG images to WebP and pre-crops to display dimensions.
// Run: node scripts/convert-webp.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ExploreSection/Main — used at 430×305 in detail view (object-fit:cover)
// Card view uses 68×58 but detail is the constraint.
// 2× for retina → 860×610
async function convertExploreMains() {
  const dir = path.join(ROOT, 'assets/ExploreSection/Main');
  const files = fs.readdirSync(dir).filter(f => /^\d+\.png$/i.test(f));
  console.log(`Converting ${files.length} ExploreSection/Main PNGs…`);
  for (const file of files) {
    const src = path.join(dir, file);
    const dest = path.join(dir, file.replace(/\.png$/i, '.webp'));
    await sharp(src)
      .resize(860, 610, { fit: 'cover', position: 'attention' }) // smart crop center
      .webp({ quality: 82, effort: 5 })
      .toFile(dest);
    const before = fs.statSync(src).size;
    const after = fs.statSync(dest).size;
    console.log(`  ${file} ${(before/1024/1024).toFixed(1)}MB → ${file.replace('.png','.webp')} ${(after/1024).toFixed(0)}KB (-${Math.round((1-after/before)*100)}%)`);
  }
}

// ExploreSection/DiscoverImages ref-tile PNGs — keep original size, just compress to WebP
async function convertRefTiles() {
  const dir = path.join(ROOT, 'assets/ExploreSection/DiscoverImages');
  const files = fs.readdirSync(dir).filter(f => /^ref-tile.*\.png$/i.test(f));
  console.log(`\nConverting ${files.length} ref-tile PNGs…`);
  for (const file of files) {
    const src = path.join(dir, file);
    const dest = path.join(dir, file.replace(/\.png$/i, '.webp'));
    await sharp(src)
      .webp({ quality: 82, effort: 5 })
      .toFile(dest);
    const before = fs.statSync(src).size;
    const after = fs.statSync(dest).size;
    console.log(`  ${file} ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${Math.round((1-after/before)*100)}%)`);
  }
}

// find-words-bg.png in DiscoverImages
async function convertMiscDiscoverPngs() {
  const dir = path.join(ROOT, 'assets/ExploreSection/DiscoverImages');
  const files = fs.readdirSync(dir).filter(f => /\.png$/i.test(f) && !/^ref-tile/i.test(f));
  if (!files.length) return;
  console.log(`\nConverting ${files.length} misc DiscoverImages PNGs…`);
  for (const file of files) {
    const src = path.join(dir, file);
    const dest = path.join(dir, file.replace(/\.png$/i, '.webp'));
    await sharp(src).webp({ quality: 82, effort: 5 }).toFile(dest);
    const before = fs.statSync(src).size;
    const after = fs.statSync(dest).size;
    console.log(`  ${file} ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${Math.round((1-after/before)*100)}%)`);
  }
}

// Tools section small icons (badge.png, breath.png, etc.)
async function convertToolIcons() {
  const dir = path.join(ROOT, 'assets/tools');
  const files = fs.readdirSync(dir).filter(f => /\.png$/i.test(f));
  if (!files.length) return;
  console.log(`\nConverting ${files.length} tool icons…`);
  for (const file of files) {
    const src = path.join(dir, file);
    const dest = path.join(dir, file.replace(/\.png$/i, '.webp'));
    await sharp(src).webp({ quality: 88, effort: 5 }).toFile(dest);
    const before = fs.statSync(src).size;
    const after = fs.statSync(dest).size;
    console.log(`  ${file} ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${Math.round((1-after/before)*100)}%)`);
  }
}

// WelcomeSectionBG SVGs — if they contain embedded rasters they'll be large.
// Convert to WebP at 430×932 (app canvas size @1× → 860×1864 @2×)
async function convertWelcomeBG() {
  const dir = path.join(ROOT, 'assets/WelcomeSectionBG');
  const files = fs.readdirSync(dir).filter(f => /\.svg$/i.test(f));
  console.log(`\nChecking ${files.length} WelcomeSectionBG SVGs for embedded rasters…`);
  for (const file of files) {
    const src = path.join(dir, file);
    const content = fs.readFileSync(src, 'utf8');
    const hasEmbedded = content.includes('data:image') || content.includes('<image');
    const sizeMB = (fs.statSync(src).size / 1024 / 1024).toFixed(2);
    if (hasEmbedded || parseFloat(sizeMB) > 0.3) {
      const dest = path.join(dir, file.replace(/\.svg$/i, '.webp'));
      try {
        await sharp(Buffer.from(content))
          .resize(860, 1864, { fit: 'cover', position: 'top' })
          .webp({ quality: 88, effort: 5 })
          .toFile(dest);
        const after = fs.statSync(dest).size;
        console.log(`  ${file} ${sizeMB}MB → ${file.replace('.svg','.webp')} ${(after/1024).toFixed(0)}KB (-${Math.round((1-after/fs.statSync(src).size)*100)}%) [has embedded: ${hasEmbedded}]`);
      } catch (e) {
        console.log(`  ${file} — sharp cannot render this SVG (${e.message}). Convert manually.`);
      }
    } else {
      console.log(`  ${file} — pure vector ${sizeMB}MB, keeping as SVG`);
    }
  }
}

// SetupSectionBG SVGs with embedded rasters (companion screens, S0, S8)
async function convertSetupBG() {
  const dir = path.join(ROOT, 'assets/SetupSectionBG');
  const allSvgs = [];
  function collectSvgs(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) collectSvgs(full);
      else if (/\.svg$/i.test(entry.name)) allSvgs.push(full);
    }
  }
  collectSvgs(dir);
  const large = allSvgs.filter(f => fs.statSync(f).size > 100 * 1024);
  console.log(`\nConverting ${large.length} SetupSectionBG SVGs (>100KB)…`);
  for (const src of large) {
    const dest = src.replace(/\.svg$/i, '.webp');
    const content = fs.readFileSync(src, 'utf8');
    try {
      await sharp(Buffer.from(content))
        .resize(860, 1864, { fit: 'cover', position: 'top' })
        .webp({ quality: 88, effort: 5 })
        .toFile(dest);
      const before = fs.statSync(src).size;
      const after = fs.statSync(dest).size;
      const rel = path.relative(ROOT, src);
      console.log(`  ${rel} ${(before/1024/1024).toFixed(2)}MB → ${(after/1024).toFixed(0)}KB (-${Math.round((1-after/before)*100)}%)`);
    } catch (e) {
      console.log(`  ${path.relative(ROOT, src)} — could not convert: ${e.message}`);
    }
  }
}

(async () => {
  try {
    await convertExploreMains();
    await convertRefTiles();
    await convertMiscDiscoverPngs();
    await convertToolIcons();
    await convertWelcomeBG();
    await convertSetupBG();
    console.log('\nDone. Now update app.js/.css references from .png/.svg to .webp where generated.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
