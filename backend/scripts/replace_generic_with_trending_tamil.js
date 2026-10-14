const crypto = require("crypto");
const mongoose = require("mongoose");
const Song = require("../models/Song");

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

const TRENDING_TAMIL_SEARCHES = [
  { query: "Manasilaayo Vettaiyan", title: "Manasilaayo", artist: "Anirudh Ravichander, Malaysia Vasudevan (Vettaiyan)", category: "Tamil High Energy" },
  { query: "Hunter Vantaar Vettaiyan", title: "Hunter Vantaar", artist: "Anirudh Ravichander, Arivu (Vettaiyan)", category: "Tamil High Energy" },
  { query: "Aasa Kooda Sai Abhyankkar", title: "Aasa Kooda", artist: "Sai Abhyankkar, Sai Smriti", category: "Tamil Indie & Pop" },
  { query: "Katchi Sera Sai Abhyankkar", title: "Katchi Sera", artist: "Sai Abhyankkar", category: "Tamil Indie & Pop" },
  { query: "Chuttamalle Devara Tamil", title: "Chuttamalle", artist: "Anirudh Ravichander, Shilpa Rao (Devara)", category: "Tamil Melodies" },
  { query: "Fear Song Devara Tamil", title: "Fear Song", artist: "Anirudh Ravichander (Devara)", category: "Tamil High Energy" },
  { query: "Whistle Podu GOAT", title: "Whistle Podu", artist: "Thalapathy Vijay, Yuvan Shankar Raja (The Greatest of All Time)", category: "Tamil High Energy" },
  { query: "Spark GOAT Yuvan", title: "Spark", artist: "Yuvan Shankar Raja, Vrusha Balu (The Greatest of All Time)", category: "Tamil Melodies" },
  { query: "Matta GOAT Yuvan", title: "Matta", artist: "Yuvan Shankar Raja, Shenbagaraj (The Greatest of All Time)", category: "Tamil High Energy" },
  { query: "Water Packet Raayan", title: "Water Packet", artist: "A.R. Rahman, Santhosh Narayanan, Shweta Mohan (Raayan)", category: "Tamil Melodies" },
  { query: "Raayan Rumble AR Rahman", title: "Raayan Rumble", artist: "A.R. Rahman, Arivu (Raayan)", category: "Tamil High Energy" }
];

async function replaceGeneric() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  console.log("Connected to MongoDB");

  const genericLabels = [
    "NeuroFocus Sound Lab",
    "Binaural Mind Research",
    "Acoustic Biosphere",
    "Monk Harmonic Ensemble",
    "Spatial Frequency Lab",
    "Deep Calm Collective",
    "SynthWave Pulse",
    "Neon Circuitry",
    "Glitch Code Beats",
    "Algorithm Acoustics",
    "Solitude Chamber"
  ];

  const genericSongs = await Song.find({ artist: { $in: genericLabels } });
  console.log(`Found ${genericSongs.length} placeholder tracks to replace with trending Tamil songs.`);

  for (let i = 0; i < genericSongs.length && i < TRENDING_TAMIL_SEARCHES.length; i++) {
    const s = genericSongs[i];
    const trend = TRENDING_TAMIL_SEARCHES[i];
    console.log(`Searching for: ${trend.query}...`);
    const results = await searchSaavn(trend.query);

    let audioUrl = s.audioUrl;
    let imageUrl = s.imageUrl;
    let duration = "03:45";

    if (results.length > 0) {
      const top = results[0];
      const direct = decryptMediaUrl(top.more_info?.encrypted_media_url);
      if (direct) audioUrl = direct;
      if (top.image) imageUrl = top.image.replace("150x150", "500x500");
      if (top.more_info?.duration) {
        const sec = parseInt(top.more_info.duration, 10);
        const m = Math.floor(sec / 60);
        const rem = sec % 60;
        duration = `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
      }
    }

    s.title = trend.title;
    s.artist = trend.artist;
    s.category = trend.category;
    s.audioUrl = audioUrl;
    s.imageUrl = imageUrl;
    s.duration = duration;
    s.audioFeatures = {
      tempo: 105 + (i * 4),
      energy: 0.75,
      danceability: 0.78,
      valence: 0.72,
      acousticness: 0.45,
      spectralCentroid: 2200,
      spectralRolloff: 3400,
      spectralContrast: 0.6,
      zeroCrossingRate: 0.05,
      calmness: 0.45,
      vector: [0.45, 0.75, 0.78, 0.72, 0.45, 0.6, 0.65, 0.7, 0.85, 0.45]
    };

    await s.save();
    console.log(`-> Replaced with: ${s.title} (${s.artist})`);
  }

  console.log("Trending Tamil replacement complete!");
  await mongoose.disconnect();
}

replaceGeneric().catch(console.error);
