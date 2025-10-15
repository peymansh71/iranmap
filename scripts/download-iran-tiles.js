const fs = require("fs");
const path = require("path");
const https = require("https");

// Extended bounds to cover Iran + neighboring countries (Turkey, Iraq, Afghanistan, Pakistan, etc.)
const EXTENDED_BOUNDS = {
  north: 45, // Covers Turkey, Armenia, Azerbaijan
  south: 20, // Covers Persian Gulf, part of Saudi Arabia
  east: 75, // Covers Afghanistan, Pakistan
  west: 35, // Covers Turkey, Iraq, Syria
};

// Multiple zoom levels for different detail levels
const ZOOM_LEVELS = [4, 5, 6, 7, 8, 9, 10]; // Added lower zoom levels for wider coverage

// Create tiles directory
const TILES_DIR = path.join(process.cwd(), "public", "offline-tiles");

console.log("🌍 Extended Iran Map Tile Downloader");
console.log("====================================");
console.log("📍 Coverage: Iran + Neighboring Countries");
console.log(`📁 Downloading tiles to: ${TILES_DIR}`);
console.log(
  `🌍 Bounds: N:${EXTENDED_BOUNDS.north} S:${EXTENDED_BOUNDS.south} E:${EXTENDED_BOUNDS.east} W:${EXTENDED_BOUNDS.west}`
);
console.log(`🔍 Zoom levels: ${ZOOM_LEVELS.join(", ")}`);
console.log(
  "🗺️  Includes: Iran, Turkey, Iraq, Syria, Afghanistan, Pakistan, Armenia, Azerbaijan"
);

// Convert lat/lng to tile coordinates
function deg2num(lat_deg, lon_deg, zoom) {
  const lat_rad = (lat_deg * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xtile = Math.floor(((lon_deg + 180) / 360) * n);
  const ytile = Math.floor(
    ((1 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2) * n
  );
  return { x: xtile, y: ytile };
}

// Calculate total tiles needed
let totalTiles = 0;
let zoomBreakdown = {};

for (const zoom of ZOOM_LEVELS) {
  const nw = deg2num(EXTENDED_BOUNDS.north, EXTENDED_BOUNDS.west, zoom);
  const se = deg2num(EXTENDED_BOUNDS.south, EXTENDED_BOUNDS.east, zoom);
  const tilesInThisZoom = (se.x - nw.x + 1) * (se.y - nw.y + 1);
  totalTiles += tilesInThisZoom;
  zoomBreakdown[zoom] = tilesInThisZoom;
  console.log(`📊 Zoom ${zoom}: ${tilesInThisZoom.toLocaleString()} tiles`);
}

console.log(`📊 Total tiles to download: ${totalTiles.toLocaleString()}`);
console.log(`📊 Estimated size: ~${Math.round((totalTiles * 15) / 1024)} MB`);
console.log("");

// Download delay to be respectful to OSM servers
const DOWNLOAD_DELAY = 150; // Increased delay for larger download

let downloadedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// Rate limiting - max concurrent downloads
const MAX_CONCURRENT = 3;
let activeDownloads = 0;
const downloadQueue = [];

async function downloadTile(url, filePath) {
  return new Promise((resolve, reject) => {
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      skippedCount++;
      resolve("exists");
      return;
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            downloadedCount++;
            resolve("downloaded");
          });
        } else {
          file.close();
          fs.unlink(filePath, () => {}); // Delete empty file
          errorCount++;
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(filePath, () => {}); // Delete empty file
        errorCount++;
        reject(err);
      });
  });
}

async function downloadWithQueue(url, filePath) {
  return new Promise((resolve) => {
    const download = async () => {
      activeDownloads++;
      try {
        const result = await downloadTile(url, filePath);
        resolve(result);
      } catch (error) {
        // Continue on error
        resolve("error");
      } finally {
        activeDownloads--;
        // Process next in queue
        if (downloadQueue.length > 0 && activeDownloads < MAX_CONCURRENT) {
          const next = downloadQueue.shift();
          next();
        }
      }
    };

    if (activeDownloads < MAX_CONCURRENT) {
      download();
    } else {
      downloadQueue.push(download);
    }
  });
}

async function downloadAllTiles() {
  console.log("🚀 Starting extended download...");
  console.log("⚠️  This will take 30-60 minutes depending on your connection");
  console.log(
    "💡 You can stop and resume anytime - script skips existing tiles\n"
  );

  const startTime = Date.now();

  for (const zoom of ZOOM_LEVELS) {
    console.log(
      `📥 Downloading zoom level ${zoom}... (${zoomBreakdown[
        zoom
      ].toLocaleString()} tiles)`
    );
    const zoomStartTime = Date.now();

    const nw = deg2num(EXTENDED_BOUNDS.north, EXTENDED_BOUNDS.west, zoom);
    const se = deg2num(EXTENDED_BOUNDS.south, EXTENDED_BOUNDS.east, zoom);

    const promises = [];
    for (let x = nw.x; x <= se.x; x++) {
      for (let y = nw.y; y <= se.y; y++) {
        const url = `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
        const filePath = path.join(
          TILES_DIR,
          zoom.toString(),
          x.toString(),
          `${y}.png`
        );

        promises.push(downloadWithQueue(url, filePath));

        // Progress update every 100 tiles
        if (promises.length % 100 === 0) {
          const completed = downloadedCount + skippedCount + errorCount;
          const progress = Math.round((completed / totalTiles) * 100);
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const estimated = Math.round((elapsed / completed) * totalTiles);

          console.log(
            `   📊 Progress: ${progress}% | Downloaded: ${downloadedCount} | Skipped: ${skippedCount} | Errors: ${errorCount} | ETA: ${Math.round(
              (estimated - elapsed) / 60
            )}min`
          );
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_DELAY));
      }
    }

    // Wait for all tiles in this zoom level
    await Promise.all(promises);

    const zoomTime = Math.round((Date.now() - zoomStartTime) / 1000);
    console.log(
      `✅ Zoom level ${zoom} completed in ${Math.round(zoomTime / 60)}min\n`
    );
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  console.log("🎉 Extended download completed!");
  console.log("==============================");
  console.log(`✅ Downloaded: ${downloadedCount.toLocaleString()} tiles`);
  console.log(
    `⏭️  Skipped: ${skippedCount.toLocaleString()} tiles (already existed)`
  );
  console.log(`❌ Errors: ${errorCount.toLocaleString()} tiles`);
  console.log(`⏱️  Total time: ${Math.round(totalTime / 60)} minutes`);

  // Calculate actual size
  try {
    const { execSync } = require("child_process");
    const sizeOutput = execSync(`du -sh "${TILES_DIR}"`, { encoding: "utf8" });
    const actualSize = sizeOutput.split("\t")[0];
    console.log(`📊 Actual size: ${actualSize}`);
  } catch (e) {
    console.log(`📊 Tiles saved to: ${TILES_DIR}`);
  }

  console.log("\n🌍 Coverage includes:");
  console.log("   🇮🇷 Iran (complete)");
  console.log("   🇹🇷 Turkey");
  console.log("   🇮🇶 Iraq");
  console.log("   🇸🇾 Syria");
  console.log("   🇦🇫 Afghanistan");
  console.log("   🇵🇰 Pakistan (western part)");
  console.log("   🇦🇲 Armenia");
  console.log("   🇦🇿 Azerbaijan");
  console.log("   🇬🇪 Georgia");
  console.log("   + Persian Gulf region");

  console.log("\n💡 Your app now works completely offline!");
  console.log("   1. Toggle offline mode in dashboard");
  console.log("   2. Enjoy full map with neighboring countries");
}

// Create tiles directory if it doesn't exist
if (!fs.existsSync(TILES_DIR)) {
  fs.mkdirSync(TILES_DIR, { recursive: true });
}

// Start download
downloadAllTiles().catch(console.error);
