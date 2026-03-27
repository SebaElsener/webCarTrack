// npm install axios csv-parser json2csv

const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const { Parser } = require("json2csv");

// --------------------
// CONFIG
// --------------------
const INPUT = "clientes_con_direcciones.csv";
const OUTPUT = "clientes_con_gps.csv";
const CACHE_FILE = "geocode_cache.json";
const PROGRESS_FILE = "geocode_progress.json";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const DELAY_MS = 1200;
const MAX_RETRIES = 3;
const MAX_DISTANCE_METERS = 2000;

let cache = {};
let progress = { lastIndex: 0 };

// --------------------
// Utils
// --------------------
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function normalizeAddress(addr) {
  if (!addr) return "";

  return addr
    .replace(/\b(nan|null|undefined)\b/gi, "")
    .replace(/\((.*?)\)/g, "")
    .replace(/;/g, ".")
    .replace(/\bBS\.?AS\.?\b/gi, "Buenos Aires")
    .replace(/\b0\.0\b/g, "")
    .replace(/[^\w\s,.-]/g, "")
    .replace(/\s+/g, " ")
    .replace(/,+/g, ",")
    .replace(/^,|,$/g, "")
    .trim();
}

function ensureCountry(addr) {
  if (!addr.toLowerCase().includes("argentina")) {
    return addr + ", Argentina";
  }
  return addr;
}

function buildBestAddress(row) {
  return [row.domicilio, row.localidad, row.provincia]
    .filter(Boolean)
    .join(", ");
}

// --------------------
// DISTANCIA
// --------------------
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --------------------
// CACHE
// --------------------
let pendingSave = false;

function saveCacheAtomic() {
  const temp = CACHE_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(cache, null, 2));
  fs.renameSync(temp, CACHE_FILE);
}

function saveCacheSafe() {
  if (pendingSave) return;

  pendingSave = true;

  setTimeout(() => {
    try {
      saveCacheAtomic();
      console.log("💾 Cache guardado incremental");
    } catch (err) {
      console.error("❌ Error guardando cache:", err.message);
    }
    pendingSave = false;
  }, 2000);
}

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE));
    console.log(`🧠 Cache cargado: ${Object.keys(cache).length} entradas`);
  }
}

// --------------------
// PROGRESS
// --------------------
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE));
    console.log(`📍 Retomando desde índice ${progress.lastIndex}`);
  }
}

function saveProgress(index) {
  const temp = PROGRESS_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify({ lastIndex: index }, null, 2));
  fs.renameSync(temp, PROGRESS_FILE);
}

// --------------------
// OSM
// --------------------
async function geocodeOSM(address) {
  const normalized = ensureCountry(normalizeAddress(address));
  if (!normalized) return null;

  if (cache[normalized]) return cache[normalized];

  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: normalized,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "gps-pro-script",
      },
    });

    if (res.data.length > 0) {
      const { lat, lon } = res.data[0];
      const coords = `${lat},${lon}`;
      cache[normalized] = coords;
      saveCacheSafe();
      return coords;
    }

    return null;
  } catch {
    return null;
  }
}

// --------------------
// GOOGLE
// --------------------
async function geocodeGoogle(address) {
  const normalized = ensureCountry(normalizeAddress(address));

  try {
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: normalized,
          key: GOOGLE_API_KEY,
        },
      },
    );

    if (res.data.results.length > 0) {
      const loc = res.data.results[0].geometry.location;
      return `${loc.lat},${loc.lng}`;
    }

    return null;
  } catch {
    return null;
  }
}

// --------------------
// SMART GEOCODE
// --------------------
async function smartGeocode(row) {
  const base = buildBestAddress(row);

  console.log("🎯 Base:", base);

  let osm = await geocodeOSM(base);

  let google = null;

  if (!osm) {
    console.log("🔴 Fallback Google directo");
    return await geocodeGoogle(base);
  }

  google = await geocodeGoogle(base);

  if (google) {
    const [lat1, lon1] = osm.split(",").map(Number);
    const [lat2, lon2] = google.split(",").map(Number);

    const dist = distanceMeters(lat1, lon1, lat2, lon2);

    console.log("📏 Distancia:", Math.round(dist), "m");

    if (dist > MAX_DISTANCE_METERS) {
      console.log("⚠️ OSM impreciso → uso Google");
      return google;
    }
  }

  return osm;
}

// --------------------
// MAIN
// --------------------
async function processCSV() {
  loadCache();
  loadProgress();

  const rows = [];

  fs.createReadStream(INPUT)
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      console.log(`🚀 Procesando ${rows.length} registros...\n`);

      for (let i = progress.lastIndex; i < rows.length; i++) {
        const row = rows[i];

        console.log("\n----------------------------");
        console.log(`📍 ${i + 1}/${rows.length}`);

        const coords = await smartGeocode(row);

        row.gps_coords = coords;

        console.log("RESULT:", coords || "SIN MATCH");

        saveProgress(i + 1);

        if (i % 50 === 0) {
          saveCacheSafe();
        }

        await sleep(DELAY_MS);
      }

      saveCacheAtomic();

      const parser = new Parser();
      const csvOutput = parser.parse(rows);
      fs.writeFileSync(OUTPUT, csvOutput);

      console.log("\n✅ DONE →", OUTPUT);
    });
}

processCSV();
