const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PROJECT_ROOT = path.resolve(__dirname);
const ASSETS_DIR = path.join(PROJECT_ROOT, 'src/assets');
const UNUSED_DIR = path.join(ASSETS_DIR, 'unused');

// Make sure unused directory exists
if (!fs.existsSync(UNUSED_DIR)) fs.mkdirSync(UNUSED_DIR, { recursive: true });

// 1️⃣ Get all asset files, but only from custom, media, plugins
const allowedFolders = ['custom', 'media', 'plugins'];
const assetFiles = glob.sync(`${ASSETS_DIR}/**/*.*`, { nodir: true })
    .filter(file => {
        const relative = path.relative(ASSETS_DIR, file).replace(/\\/g, '/');
        const topFolder = relative.split('/')[0];
        return allowedFolders.includes(topFolder);
    });

// 2️⃣ Get all source files to search references
const srcFiles = glob.sync(`${PROJECT_ROOT}/src/**/*.{ts,html,scss,sass,css}`, { nodir: true });

// 3️⃣ Build content string of all source files
let sourceContent = '';
for (const file of srcFiles) {
    sourceContent += fs.readFileSync(file, 'utf8') + '\n';
}

// 4️⃣ Scan each asset
const unusedFiles = [];

for (const asset of assetFiles) {
    // Skip the "unused" folder itself
    if (asset.includes('/unused/')) continue;

    const relativePath = path.relative(PROJECT_ROOT, asset).replace(/\\/g, '/'); // Normalize
    const fileName = path.basename(asset);

    // Check if asset is referenced in the source content
    const regex = new RegExp(relativePath, 'i'); // Match full relative path
    const fileNameRegex = new RegExp(fileName, 'i'); // Match just the file name

    if (!regex.test(sourceContent) && !fileNameRegex.test(sourceContent)) {
        unusedFiles.push(asset);
    }
}

// 5️⃣ Move unused files to "unused" folder keeping structure
for (const file of unusedFiles) {
    const relativeToAssets = path.relative(ASSETS_DIR, file);
    const destPath = path.join(UNUSED_DIR, relativeToAssets);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.renameSync(file, destPath);
}

console.log(`\n🔍 Scan complete!`);
console.log(`🚀 Moved ${unusedFiles.length} unused files to src/assets/unused`);
