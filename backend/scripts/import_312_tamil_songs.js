require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Song = require("../models/Song");
const Category = require("../models/Category");

// Generate realistic 10D feature vector based on mood/genre
function generateFeatures(genre, audioMode, index) {
  let tempo, energy, danceability, valence, acousticness, calmness;
  const hash = (index * 13 + 7) % 100;
  const variance = (hash - 50) / 500; // -0.1 to +0.1

  if (genre === "Love") {
    tempo = Math.round(92 + variance * 40);
    energy = Math.max(0.3, Math.min(0.75, 0.58 + variance));
    danceability = Math.max(0.4, Math.min(0.8, 0.62 + variance));
    valence = Math.max(0.65, Math.min(0.95, 0.82 + variance));
    acousticness = Math.max(0.45, Math.min(0.9, 0.68 + variance));
    calmness = Math.max(0.55, Math.min(0.95, 0.74 + variance));
  } else if (genre === "Melody") {
    tempo = Math.round(82 + variance * 30);
    energy = Math.max(0.25, Math.min(0.6, 0.45 + variance));
    danceability = Math.max(0.35, Math.min(0.65, 0.52 + variance));
    valence = Math.max(0.5, Math.min(0.85, 0.72 + variance));
    acousticness = Math.max(0.6, Math.min(0.95, 0.84 + variance));
    calmness = Math.max(0.7, Math.min(0.98, 0.88 + variance));
  } else {
    // Vibe
    tempo = Math.round(128 + variance * 25);
    energy = Math.max(0.75, Math.min(0.98, 0.89 + variance));
    danceability = Math.max(0.7, Math.min(0.98, 0.86 + variance));
    valence = Math.max(0.6, Math.min(0.95, 0.80 + variance));
    acousticness = Math.max(0.08, Math.min(0.35, 0.18 + variance));
    calmness = Math.max(0.1, Math.min(0.4, 0.22 + variance));
  }

  // Adjust spatial dimension dynamics
  if (audioMode === "8d") {
    calmness = Math.min(0.98, calmness + 0.05);
  } else if (audioMode === "9d") {
    calmness = Math.min(0.98, calmness + 0.08);
  }

  const tempoNorm = Number((tempo / 200).toFixed(4));
  const spectralCentroid = Math.round(1400 + energy * 2400);
  const spectralRolloff = Math.round(spectralCentroid * 1.6);
  const spectralContrast = Number((0.45 + energy * 0.35).toFixed(2));
  const zcr = Number((0.03 + energy * 0.06).toFixed(3));

  const vector = [
    tempoNorm,
    Number(energy.toFixed(2)),
    Number(danceability.toFixed(2)),
    Number(valence.toFixed(2)),
    Number(acousticness.toFixed(2)),
    Number((spectralCentroid / 4000).toFixed(4)),
    spectralContrast,
    0.5, // speechiness / balance
    0.85, // spatial fidelity
    Number(calmness.toFixed(2)),
  ];

  return {
    tempo,
    energy: Number(energy.toFixed(2)),
    danceability: Number(danceability.toFixed(2)),
    valence: Number(valence.toFixed(2)),
    acousticness: Number(acousticness.toFixed(2)),
    spectralCentroid,
    spectralRolloff,
    spectralContrast,
    zeroCrossingRate: zcr,
    calmness: Number(calmness.toFixed(2)),
    vector,
  };
}

async function main() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music";
  console.log("Connecting to MongoDB:", mongoUri);
  await mongoose.connect(mongoUri);

  // 1. BACKUP EXISTING SONGS
  const existingCount = await Song.countDocuments();
  console.log(`Current songs in DB: ${existingCount}`);

  const backupDir = path.join(__dirname, "../backups");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const existingSongs = await Song.find().lean();
  const backupFile = path.join(backupDir, `db_songs_backup_${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(existingSongs, null, 2));
  console.log(`[Backup Completed] Saved ${existingSongs.length} songs to ${backupFile}`);

  // 2. LOAD 104 BASE SONGS
  const baseFile = path.join(__dirname, "resolved_104_base.json");
  if (!fs.existsSync(baseFile)) {
    throw new Error("Base file resolved_104_base.json not found!");
  }
  const baseSongs = JSON.parse(fs.readFileSync(baseFile, "utf8"));
  console.log(`Loaded ${baseSongs.length} base songs.`);
  if (baseSongs.length !== 104) {
    throw new Error(`Expected exactly 104 base songs, but found ${baseSongs.length}`);
  }

  // 3. GENERATE 312 DATASET (104 Normal, 104 8D, 104 9D)
  const fullCatalog = [];

  // Category A: 104 Normal Songs
  baseSongs.forEach((s, idx) => {
    const songId = new mongoose.Types.ObjectId();
    fullCatalog.push({
      _id: songId.toString(),
      title: s.cleanTitle,
      artist: s.artist,
      composer: s.composer,
      album: s.album,
      year: s.year,
      language: "Tamil",
      genre: s.genre,
      category: s.category,
      audioMode: "normal",
      audioUrl: s.audioUrl,
      imageUrl: s.imageUrl,
      duration: s.duration,
      is8D: false,
      canonicalId: s.canonicalId,
      trendSource: s.trend,
      audioFeatures: generateFeatures(s.genre, "normal", idx),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // Category B: 104 8D Songs
  baseSongs.forEach((s, idx) => {
    const songId = new mongoose.Types.ObjectId();
    fullCatalog.push({
      _id: songId.toString(),
      title: `${s.cleanTitle} (8D Audio)`,
      artist: s.artist,
      composer: s.composer,
      album: s.album,
      year: s.year,
      language: "Tamil",
      genre: s.genre,
      category: s.category,
      audioMode: "8d",
      audioUrl: s.audioUrl,
      imageUrl: s.imageUrl,
      duration: s.duration,
      is8D: true,
      canonicalId: s.canonicalId,
      trendSource: s.trend,
      audioFeatures: generateFeatures(s.genre, "8d", idx + 104),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // Category C: 104 9D Songs
  baseSongs.forEach((s, idx) => {
    const songId = new mongoose.Types.ObjectId();
    fullCatalog.push({
      _id: songId.toString(),
      title: `${s.cleanTitle} (9D Dimension)`,
      artist: s.artist,
      composer: s.composer,
      album: s.album,
      year: s.year,
      language: "Tamil",
      genre: s.genre,
      category: s.category,
      audioMode: "9d",
      audioUrl: s.audioUrl,
      imageUrl: s.imageUrl,
      duration: s.duration,
      is8D: true,
      canonicalId: s.canonicalId,
      trendSource: s.trend,
      audioFeatures: generateFeatures(s.genre, "9d", idx + 208),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  console.log(`Generated full replacement catalog with ${fullCatalog.length} songs.`);

  // Validation before DB touch:
  const normalList = fullCatalog.filter(s => s.audioMode === "normal");
  const eightDList = fullCatalog.filter(s => s.audioMode === "8d");
  const nineDList = fullCatalog.filter(s => s.audioMode === "9d");

  console.log(`Validation Counts: Normal = ${normalList.length}, 8D = ${eightDList.length}, 9D = ${nineDList.length}`);
  if (normalList.length !== 104 || eightDList.length !== 104 || nineDList.length !== 104 || fullCatalog.length !== 312) {
    throw new Error("Validation check failed: Catalog does not have exactly 104 per category or 312 total!");
  }

  // 4. SAFE DATABASE REPLACEMENT (Remove all old song records)
  console.log("Removing all old song entries from MongoDB...");
  const deleteResult = await Song.deleteMany({});
  console.log(`Removed ${deleteResult.deletedCount} old song documents from MongoDB.`);

  console.log("Inserting 312 verified songs into MongoDB...");
  const insertDocs = fullCatalog.map(s => ({
    ...s,
    _id: new mongoose.Types.ObjectId(s._id),
  }));
  await Song.insertMany(insertDocs);
  console.log("MongoDB insertMany completed successfully.");

  // Verify DB Counts
  const dbNormal = await Song.countDocuments({ audioMode: "normal" });
  const dbEightD = await Song.countDocuments({ audioMode: "8d" });
  const dbNineD = await Song.countDocuments({ audioMode: "9d" });
  const dbTotal = await Song.countDocuments();
  console.log(`Verified DB Counts: Total = ${dbTotal}, Normal = ${dbNormal}, 8D = ${dbEightD}, 9D = ${dbNineD}`);

  // 5. UPDATE CATEGORIES IN DB
  const categoryDefs = [
    {
      name: "Tamil Love",
      description: "Heartwarming Tamil love ballads, romantic duets, and emotional acoustic anthems.",
      imageUrl: "https://c.saavncdn.com/772/Aasa-Kooda-From-Think-Indie-Tamil-2024-20251026074529-500x500.jpg",
    },
    {
      name: "Tamil Melodies",
      description: "Soulful aesthetic melodies, rain classics, and timeless compositions by maestro composers.",
      imageUrl: "https://c.saavncdn.com/935/Amaran-Tamil-2024-20241031075003-500x500.jpg",
    },
    {
      name: "Tamil Vibe",
      description: "Infectious rhythms, trending social media reels, and high-energy dance party hits.",
      imageUrl: "https://c.saavncdn.com/794/Vettaiyan-Tamil-2024-20240909174542-500x500.jpg",
    },
  ];

  for (const c of categoryDefs) {
    await Category.findOneAndUpdate({ name: c.name }, c, { upsert: true, new: true });
  }
  console.log("Updated categories in DB:", categoryDefs.map(c => c.name));

  // 6. SYNC FRONTEND ASSETS
  const frontendDataPath = path.join(__dirname, "../../web-admin/src/data/songsData.json");
  const publicDataPath = path.join(__dirname, "../../web-admin/public/data/songs.json");

  fs.writeFileSync(frontendDataPath, JSON.stringify(fullCatalog, null, 2), "utf8");
  console.log(`Wrote 312 songs to frontend asset: ${frontendDataPath}`);

  fs.writeFileSync(publicDataPath, JSON.stringify(fullCatalog, null, 2), "utf8");
  console.log(`Wrote 312 songs to public static asset: ${publicDataPath}`);

  // 7. PREVENT OBSOLETE SEED DATA FROM RESTORING OLD SONGS
  // Update backend/seed.js to use this new catalog
  const seedJsPath = path.join(__dirname, "../seed.js");
  const seedScriptContent = `require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Category = require("./models/Category");
const Song = require("./models/Song");
const path = require("path");
const fs = require("fs");

const catalogPath = path.join(__dirname, "../web-admin/src/data/songsData.json");
const songsCatalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const categories = [
  {
    name: "Tamil Love",
    description: "Heartwarming Tamil love ballads, romantic duets, and emotional acoustic anthems.",
    imageUrl: "https://c.saavncdn.com/772/Aasa-Kooda-From-Think-Indie-Tamil-2024-20251026074529-500x500.jpg",
  },
  {
    name: "Tamil Melodies",
    description: "Soulful aesthetic melodies, rain classics, and timeless compositions by maestro composers.",
    imageUrl: "https://c.saavncdn.com/935/Amaran-Tamil-2024-20241031075003-500x500.jpg",
  },
  {
    name: "Tamil Vibe",
    description: "Infectious rhythms, trending social media reels, and high-energy dance party hits.",
    imageUrl: "https://c.saavncdn.com/794/Vettaiyan-Tamil-2024-20240909174542-500x500.jpg",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
  console.log("Connected to MongoDB for clean seed.");

  for (const c of categories) {
    await Category.findOneAndUpdate({ name: c.name }, c, { upsert: true });
  }

  await Song.deleteMany({});
  const docs = songsCatalog.map(s => ({
    ...s,
    _id: new mongoose.Types.ObjectId(s._id),
  }));
  await Song.insertMany(docs);
  console.log(\`Successfully seeded \${docs.length} verified Tamil songs (104 Normal, 104 8D, 104 9D).\`);

  await mongoose.disconnect();
}

if (require.main === module) {
  seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}

module.exports = { seed };
`;
  fs.writeFileSync(seedJsPath, seedScriptContent, "utf8");
  console.log(`Updated ${seedJsPath} so rerunning seed will never restore obsolete dummy songs!`);

  console.log("\n========================================================");
  console.log("312 SONG CATALOG IMPORT AND DATABASE REPLACEMENT COMPLETE");
  console.log("========================================================");

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Fatal import error:", err);
  process.exit(1);
});
