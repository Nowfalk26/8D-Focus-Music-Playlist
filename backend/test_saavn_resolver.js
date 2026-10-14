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
    .replace(/\s*\([^)]*mix[^)]*\)/gi, "")
    .replace(/\s*\([^)]*remix[^)]*\)/gi, "")
    .replace(/\s*-\s*.*$/g, "")
    .trim();
}

function extractMovie(artist) {
  const match = artist.match(/\(([^)]+)\)/);
  return match ? match[1].replace(/OST|Theme|Movie/gi, "").trim() : "";
}

async function searchSaavn(query) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&n=5&p=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
  console.log("Connected to MongoDB");

  const sampleSongs = await Song.find({ category: { $regex: /^Tamil/ } }).limit(10);
  console.log(`Testing resolution for ${sampleSongs.length} sample songs:\n`);

  for (const song of sampleSongs) {
    const title = cleanTitle(song.title);
    const movie = extractMovie(song.artist);
    const query1 = movie ? `${title} ${movie}` : title;

    let results = await searchSaavn(query1);
    if (!results.length && movie) {
      results = await searchSaavn(title);
    }

    if (results.length > 0) {
      const top = results[0];
      const streamUrl = decryptMediaUrl(top.encrypted_media_url);
      const artwork = top.image ? top.image.replace("150x150.jpg", "500x500.jpg") : null;
      console.log(`✅ MATCH: "${song.title}" (${song.artist})`);
      console.log(`   -> Found: "${top.song}" | Album: "${top.album}"`);
      console.log(`   -> Stream URL: ${streamUrl}`);
      console.log(`   -> Artwork: ${artwork}`);
    } else {
      console.log(`❌ NO MATCH: "${song.title}" (Query: "${query1}")`);
    }
  }

  await mongoose.disconnect();
}

run();
