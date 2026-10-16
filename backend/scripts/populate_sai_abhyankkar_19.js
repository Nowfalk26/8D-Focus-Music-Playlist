const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Decrypt JioSaavn media URL
function decryptMediaUrl(enc) {
  if (!enc) return null;
  try {
    const key = Buffer.from('38346591', 'utf-8');
    const decipher = crypto.createDecipheriv('des-ede3', Buffer.concat([key, key, key]), '');
    let dec = decipher.update(enc, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec.replace('_96.mp4', '_160.mp4');
  } catch (e) {
    return null;
  }
}

// Search JioSaavn API
async function searchSaavn(query) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&n=3&p=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

// 19 Complete Sai Abhyankkar Songs
const SAI_TRACKS = [
  // Think Indie Viral Hits
  { title: "Katchi Sera", album: "Think Indie", year: 2024, genre: "Jazz Folk", category: "Tamil Hits", artist: "Sai Abhyankkar" },
  { title: "Aasa Kooda", album: "Think Indie", year: 2024, genre: "Love Pop", category: "Tamil Love", artist: "Sai Abhyankkar, Sai Smriti" },
  { title: "Pavazha Malli", album: "Think Indie", year: 2024, genre: "Love", category: "Tamil Love", artist: "Sai Abhyankkar, Shruti Haasan" },
  { title: "Vizhi Veekura", album: "Think Indie", year: 2024, genre: "Melody", category: "Tamil Melodies", artist: "Sai Abhyankkar" },
  { title: "Radhimaa", album: "Think Indie", year: 2024, genre: "Love", category: "Tamil Love", artist: "Sai Abhyankkar" },
  { title: "Sithira Puthiri", album: "Think Indie", year: 2024, genre: "Melody", category: "Tamil Melodies", artist: "Sai Abhyankkar" },

  // Film Soundtracks - Dude
  { title: "Oorum Blood", album: "Dude", year: 2024, genre: "Kuthu", category: "Tamil Mass", artist: "Sai Abhyankkar" },
  { title: "Nallaru Po", album: "Dude", year: 2024, genre: "Love", category: "Tamil Love", artist: "Sai Abhyankkar" },
  { title: "Boom Boom", album: "Dude", year: 2024, genre: "Dance", category: "Tamil Hits", artist: "Sai Abhyankkar" },
  { title: "Baagundu Po", album: "Dude", year: 2024, genre: "Love", category: "Tamil Love", artist: "Sai Abhyankkar" },
  { title: "Nee Gunde Lona", album: "Dude", year: 2024, genre: "Melody", category: "Tamil Melodies", artist: "Sai Abhyankkar" },

  // Film Soundtracks - Karuppu
  { title: "Karuppa Kooda Va", album: "Karuppu", year: 2024, genre: "Folk Mass", category: "Tamil Mass", artist: "Sai Abhyankkar" },
  { title: "God Mode", album: "Karuppu", year: 2024, genre: "Mass Theme", category: "Tamil Mass", artist: "Sai Abhyankkar" },
  { title: "Raathu Raasan", album: "Karuppu", year: 2024, genre: "Folk", category: "Tamil Hits", artist: "Sai Abhyankkar" },

  // Film Soundtracks - Baththa
  { title: "Ooroda Oththa Don", album: "Baththa", year: 2024, genre: "Kuthu Mass", category: "Tamil Mass", artist: "Sai Abhyankkar" },
  { title: "Magale", album: "Baththa", year: 2024, genre: "Melody", category: "Tamil Melodies", artist: "Sai Abhyankkar" },

  // Other Films & Projects
  { title: "Balti", album: "Balti", year: 2024, genre: "Folk", category: "Tamil Hits", artist: "Sai Abhyankkar" },
  { title: "VeeraBhadrudu", album: "VeeraBhadrudu", year: 2024, genre: "Mass Theme", category: "Tamil Mass", artist: "Sai Abhyankkar" },
  { title: "Benz Theme", album: "Benz", year: 2025, genre: "Action Theme", category: "Tamil Mass", artist: "Sai Abhyankkar" }
];

// Load existing songs
const songsDataPath = path.join(__dirname, '../../web-admin/src/data/songsData.json');
let existingSongs = [];
if (fs.existsSync(songsDataPath)) {
  try {
    existingSongs = JSON.parse(fs.readFileSync(songsDataPath, 'utf8'));
    console.log(`Loaded ${existingSongs.length} existing songs from songsData.json`);
  } catch (e) {
    console.warn("Could not parse existing songs:", e.message);
  }
}

// Backup check
let existingBackup = [];
const backupPath = path.join(__dirname, '../../web-admin/src/data/songsData.backup.json');
if (fs.existsSync(backupPath)) {
  try {
    existingBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  } catch (e) {}
}

const backupMap = new Map();
for (const s of existingBackup) {
  if (!s.title) continue;
  const clean = s.title.toLowerCase().replace(/\s*\([^)]*8d[^)]*\)/i, '').replace(/[^a-z0-9]/g, '');
  if (!backupMap.has(clean) || (s.audioUrl && !backupMap.get(clean).audioUrl)) {
    backupMap.set(clean, s);
  }
}

async function run() {
  const newSaiTracks = [];
  let reusedCount = 0;
  let resolvedCount = 0;

  console.log("Resolving 19 Sai Abhyankkar tracks via JioSaavn API...");

  for (let i = 0; i < SAI_TRACKS.length; i++) {
    const raw = SAI_TRACKS[i];
    const cleanKey = raw.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    let audioUrl = null;
    let imageUrl = "https://c.saavncdn.com/118/Katchi-Sera-From-Think-Indie-Tamil-2024-20251026074526-500x500.jpg";
    let duration = "03:15";

    // 1. Check backup first
    if (backupMap.has(cleanKey)) {
      const b = backupMap.get(cleanKey);
      if (b.audioUrl) {
        audioUrl = b.audioUrl;
        imageUrl = b.imageUrl || imageUrl;
        duration = b.duration || duration;
        reusedCount++;
      }
    }

    // 2. Search JioSaavn if not found
    if (!audioUrl) {
      const q = `${raw.title} Sai Abhyankkar ${raw.album}`;
      const results = await searchSaavn(q);
      if (results && results.length > 0) {
        const top = results[0];
        const decrypted = decryptMediaUrl(top.encrypted_media_url);
        if (decrypted) {
          audioUrl = decrypted;
          if (top.image) imageUrl = top.image.replace("150x150.jpg", "500x500.jpg");
          if (top.duration) {
            const m = Math.floor(parseInt(top.duration, 10) / 60);
            const s = parseInt(top.duration, 10) % 60;
            duration = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          }
          resolvedCount++;
        }
      }
    }

    // Fallback URL if still not resolved
    if (!audioUrl) {
      audioUrl = "https://aac.saavncdn.com/772/6cb3205b2579e7ade889bd6898d9f2b6_160.mp4";
    }

    const baseId = crypto.createHash('md5').update(`sai-${raw.title}-${raw.album}`).digest('hex').slice(0, 24);
    const id8D = crypto.createHash('md5').update(`sai-${raw.title}-${raw.album}-8d`).digest('hex').slice(0, 24);

    const normalSong = {
      _id: baseId,
      id: baseId,
      title: raw.title,
      artist: raw.artist,
      composer: "Sai Abhyankkar",
      album: raw.album,
      year: raw.year,
      language: "Tamil",
      genre: raw.genre,
      category: raw.category,
      audioMode: "normal",
      audioUrl: audioUrl,
      imageUrl: imageUrl,
      duration: duration,
      is8D: false,
      canonicalId: `sai-${baseId.slice(0, 8)}`,
      trendSource: "Sai Abhyankkar Complete Hits",
      audioFeatures: {
        tempo: 105,
        energy: 0.65,
        danceability: 0.75,
        valence: 0.80,
        acousticness: 0.45,
        spectralCentroid: 2400,
        spectralRolloff: 3900,
        spectralContrast: 0.60,
        zeroCrossingRate: 0.05,
        calmness: 0.60,
        vector: [0.50, 0.65, 0.75, 0.80, 0.45, 0.60, 0.60, 0.50, 0.85, 0.60]
      }
    };

    const eightDSong = {
      _id: id8D,
      id: id8D,
      title: `${raw.title} (8D Audio)`,
      artist: raw.artist,
      composer: "Sai Abhyankkar",
      album: raw.album,
      year: raw.year,
      language: "Tamil",
      genre: raw.genre,
      category: "Spatial 8D",
      audioMode: "8d",
      audioUrl: audioUrl,
      imageUrl: imageUrl,
      duration: duration,
      is8D: true,
      canonicalId: `sai-8d-${id8D.slice(0, 8)}`,
      trendSource: "Sai Abhyankkar 8D Spatial Immersion",
      audioFeatures: {
        tempo: 105,
        energy: 0.70,
        danceability: 0.78,
        valence: 0.82,
        acousticness: 0.40,
        spectralCentroid: 2500,
        spectralRolloff: 4000,
        spectralContrast: 0.62,
        zeroCrossingRate: 0.05,
        calmness: 0.62,
        vector: [0.50, 0.70, 0.78, 0.82, 0.40, 0.62, 0.62, 0.50, 0.95, 0.62]
      }
    };

    newSaiTracks.push(normalSong);
    newSaiTracks.push(eightDSong);
  }

  console.log(`Resolution complete! Reused: ${reusedCount}, API Resolved: ${resolvedCount}`);
  console.log(`Generated Sai Abhyankkar tracks: ${newSaiTracks.length} (${newSaiTracks.length / 2} Normal + ${newSaiTracks.length / 2} 8D)`);

  const combined = [...existingSongs, ...newSaiTracks];
  console.log(`Total combined library size: ${combined.length} tracks.`);

  fs.writeFileSync(songsDataPath, JSON.stringify(combined, null, 2), 'utf8');
  console.log(`Saved ${combined.length} tracks to ${songsDataPath}`);

  // Populate into MongoDB
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/focus_music', { timeoutMS: 5000 });
    await mongoose.connection.collection('songs').deleteMany({});
    await mongoose.connection.collection('songs').insertMany(combined);
    console.log(`Successfully synced ${combined.length} songs to MongoDB!`);
    await mongoose.disconnect();
  } catch (e) {
    console.warn("MongoDB update notice:", e.message);
  }

  process.exit(0);
}

run();
