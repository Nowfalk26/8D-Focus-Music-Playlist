require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const Song = require("./models/Song");

function decryptMediaUrl(enc) {
  if (!enc) return null;
  try {
    const key = Buffer.from("38346591", "utf-8");
    const decipher = crypto.createDecipheriv("des-ede3", Buffer.concat([key, key, key]), "");
    let dec = decipher.update(enc, "base64", "utf8");
    dec += decipher.final("utf8");
    return dec.replace("_96.mp4", "_160.mp4");
  } catch (e) {
    return null;
  }
}

function cleanTitle(title) {
  return title
    .replace(/\s*\([^)]*8d[^)]*\)/gi, "")
    .replace(/\s*\([^)]*spatial[^)]*\)/gi, "")
    .replace(/\s*\([^)]*chill[^)]*\)/gi, "")
    .replace(/\s*\([^)]*blast[^)]*\)/gi, "")
    .replace(/\s*\([^)]*kuthu[^)]*\)/gi, "")
    .replace(/\s*\([^)]*melodic[^)]*\)/gi, "")
    .replace(/\s*\([^)]*orbit[^)]*\)/gi, "")
    .replace(/\s*\([^)]*mix[^)]*\)/gi, "")
    .replace(/\s*\([^)]*remix[^)]*\)/gi, "")
    .replace(/\s*-\s*.*$/g, "")
    .trim();
}

function extractMovie(artist) {
  const match = artist.match(/\(([^)]+)\)/);
  if (!match) return "";
  return match[1]
    .replace(/OST|Theme|Movie|Original|Soundtrack/gi, "")
    .trim();
}

function formatDuration(sec) {
  const s = parseInt(sec, 10);
  if (isNaN(s) || s <= 0) return "04:00";
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

async function searchSaavn(query) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&n=10&p=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

function pickBestResult(results, targetTitle) {
  if (!results || results.length === 0) return null;

  // 1. Try Tamil results first
  const tamilResults = results.filter(
    (r) => r.language === "tamil" || r.more_info?.language === "tamil"
  );
  const candidatePool = tamilResults.length > 0 ? tamilResults : results;

  // 2. Try to match title if possible
  const normTarget = targetTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const r of candidatePool) {
    const songName = (r.song || r.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (songName.includes(normTarget) || normTarget.includes(songName)) {
      return r;
    }
  }

  // 3. Default to first in candidatePool
  return candidatePool[0];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
  console.log("Connected to MongoDB");

  const songs = await Song.find({ category: { $regex: /^Tamil/ } });
  console.log(`Found ${songs.length} Tamil songs to update with authentic real audio streams.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const cleanedTitle = cleanTitle(song.title);
    const movie = extractMovie(song.artist);

    // Queries in order of precision
    const queries = [];
    if (movie) queries.push(`${cleanedTitle} ${movie}`);
    queries.push(`${cleanedTitle} Tamil`);
    queries.push(cleanedTitle);

    let bestResult = null;
    for (const q of queries) {
      const results = await searchSaavn(q);
      if (results && results.length > 0) {
        bestResult = pickBestResult(results, cleanedTitle);
        if (bestResult) break;
      }
      await sleep(40);
    }

    if (bestResult && bestResult.encrypted_media_url) {
      const realStreamUrl = decryptMediaUrl(bestResult.encrypted_media_url);
      const rawImage = bestResult.image || "";
      const realArtwork = rawImage ? rawImage.replace("150x150.jpg", "500x500.jpg") : song.imageUrl;
      const realDuration = bestResult.more_info?.duration
        ? formatDuration(bestResult.more_info.duration)
        : song.duration;

      if (realStreamUrl) {
        song.audioUrl = realStreamUrl;
        if (realArtwork) song.imageUrl = realArtwork;
        if (realDuration) song.duration = realDuration;
        await song.save();

        updatedCount++;
        console.log(
          `[${i + 1}/${songs.length}] ✅ Real Audio Linked: "${song.title}" -> "${bestResult.song}" (${bestResult.album}) [${song.duration}]`
        );
      } else {
        skippedCount++;
        console.log(`[${i + 1}/${songs.length}] ⚠️ Could not decrypt audio: "${song.title}"`);
      }
    } else {
      skippedCount++;
      console.log(`[${i + 1}/${songs.length}] ❌ Not found on JioSaavn: "${song.title}"`);
    }

    // Polite delay between requests
    await sleep(60);
  }

  console.log("\n============================================================");
  console.log(`🎉 Audio Update Complete!`);
  console.log(`   Real Tracks Successfully Linked: ${updatedCount} / ${songs.length}`);
  console.log(`   Skipped/Fallback: ${skippedCount}`);
  console.log("============================================================");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
