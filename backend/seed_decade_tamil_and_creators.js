require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const Song = require("./models/Song");
const Category = require("./models/Category");

// Decrypt JioSaavn media URL to 160kbps AAC stream
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
    .replace(/\s*\([^)]*groove[^)]*\)/gi, "")
    .replace(/\s*\([^)]*mix[^)]*\)/gi, "")
    .replace(/\s*\([^)]*remix[^)]*\)/gi, "")
    .replace(/\s*-\s*.*$/g, "")
    .trim();
}

function extractMovie(artist) {
  const match = artist.match(/\(([^)]+)\)/);
  if (!match) return "";
  return match[1].replace(/OST|Theme|Movie|Original|Soundtrack/gi, "").trim();
}

function formatDuration(sec) {
  const s = parseInt(sec, 10);
  if (isNaN(s) || s <= 0) return "04:15";
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

async function searchSaavn(query) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&n=8&p=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

function pickBestResult(results, targetTitle) {
  if (!results || results.length === 0) return null;
  const tamilResults = results.filter(
    (r) => r.language === "tamil" || r.more_info?.language === "tamil"
  );
  const candidatePool = tamilResults.length > 0 ? tamilResults : results;
  const normTarget = targetTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const r of candidatePool) {
    const songName = (r.song || r.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (songName.includes(normTarget) || normTarget.includes(songName)) {
      return r;
    }
  }
  return candidatePool[0];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// New Categories to add
const newCategories = [
  {
    name: "Tamil Gana & Folk",
    description: "Authentic local Gana, street celebration anthems, and creator folk rhythms.",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Tamil Indie & Creators",
    description: "Trending YouTube creator songs, viral reels, Madras Gig, and independent indie waves.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60"
  }
];

// Comprehensive 2014-2024 Tamil Blockbusters + Content Creator Track Catalog
const rawTrackCatalog = [
  // --- 2024 BLOCKBUSTERS ---
  {
    title: "Manasilaayo (8D Energy)",
    artist: "Anirudh Ravichander, Malaysia Vasudevan, Yugendran (Vettaiyan)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.94, danceability: 0.9, valence: 0.88, acousticness: 0.18, calmness: 0.15 }
  },
  {
    title: "Hunter Vantaar (8D Swagger)",
    artist: "Anirudh Ravichander, Siddharth Basrur (Vettaiyan)",
    category: "Tamil Movie Hits",
    features: { tempo: 110, energy: 0.9, danceability: 0.78, valence: 0.75, acousticness: 0.2, calmness: 0.2 }
  },
  {
    title: "Matta (8D Party Blast)",
    artist: "Yuvan Shankar Raja, Shenbagaraj (GOAT)",
    category: "Tamil High Energy",
    features: { tempo: 138, energy: 0.96, danceability: 0.92, valence: 0.89, acousticness: 0.12, calmness: 0.1 }
  },
  {
    title: "Spark (8D Electro)",
    artist: "Yuvan Shankar Raja, Vrusha Balu (GOAT)",
    category: "Tamil High Energy",
    features: { tempo: 124, energy: 0.86, danceability: 0.84, valence: 0.76, acousticness: 0.22, calmness: 0.22 }
  },
  {
    title: "Chinna Chinna Kangal (8D Nostalgia)",
    artist: "Thalapathy Vijay, Bhavatharini, Yuvan Shankar Raja (GOAT)",
    category: "Tamil Melodies 8D",
    features: { tempo: 82, energy: 0.44, danceability: 0.52, valence: 0.58, acousticness: 0.74, calmness: 0.78 }
  },
  {
    title: "Whistle Podu (8D Anthem)",
    artist: "Thalapathy Vijay, Yuvan Shankar Raja (GOAT)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.92, danceability: 0.88, valence: 0.85, acousticness: 0.15, calmness: 0.18 }
  },
  {
    title: "Usure Neethaney (8D Soul)",
    artist: "A.R. Rahman, Stephen Zechariah (Raayan)",
    category: "Tamil Melodies 8D",
    features: { tempo: 88, energy: 0.55, danceability: 0.58, valence: 0.62, acousticness: 0.65, calmness: 0.7 }
  },
  {
    title: "Water Packet (8D Folk Groove)",
    artist: "Santhosh Narayanan, Shweta Mohan, A.R. Rahman (Raayan)",
    category: "Tamil Melodies 8D",
    features: { tempo: 96, energy: 0.68, danceability: 0.75, valence: 0.78, acousticness: 0.48, calmness: 0.55 }
  },
  {
    title: "Raayan Dumble (8D Intense)",
    artist: "A.R. Rahman (Raayan)",
    category: "Tamil Movie Hits",
    features: { tempo: 115, energy: 0.88, danceability: 0.72, valence: 0.65, acousticness: 0.25, calmness: 0.25 }
  },
  {
    title: "Adangaatha Asuran (8D Battle)",
    artist: "Dhanush, A.R. Rahman (Raayan)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.94, danceability: 0.82, valence: 0.7, acousticness: 0.18, calmness: 0.15 }
  },
  {
    title: "Vennilavu Saaral (8D Rain)",
    artist: "Kapil Kapilan, Rakshita Suresh, G.V. Prakash Kumar (Amaran)",
    category: "Tamil Melodies 8D",
    features: { tempo: 84, energy: 0.48, danceability: 0.56, valence: 0.64, acousticness: 0.7, calmness: 0.76 }
  },
  {
    title: "Poraen Naa Poraen (8D Village)",
    artist: "Kamal Haasan, Santhosh Narayanan (Meiyazhagan)",
    category: "Tamil Ambient Relax",
    features: { tempo: 75, energy: 0.38, danceability: 0.45, valence: 0.52, acousticness: 0.82, calmness: 0.85 }
  },
  {
    title: "Chillanjirukkiye (8D Sweet Melody)",
    artist: "Sean Roldan, Pradeep Kumar (Lubber Pandhu)",
    category: "Tamil Melodies 8D",
    features: { tempo: 86, energy: 0.45, danceability: 0.6, valence: 0.68, acousticness: 0.72, calmness: 0.75 }
  },
  {
    title: "Dheemthanakka (8D Street Folk)",
    artist: "Sean Roldan (Lubber Pandhu)",
    category: "Tamil Gana & Folk",
    features: { tempo: 122, energy: 0.88, danceability: 0.86, valence: 0.82, acousticness: 0.3, calmness: 0.25 }
  },
  {
    title: "Thenkizhakku (8D Soil Love)",
    artist: "Santhosh Narayanan, Dhee (Vaazhai)",
    category: "Tamil Melodies 8D",
    features: { tempo: 80, energy: 0.42, danceability: 0.5, valence: 0.55, acousticness: 0.8, calmness: 0.82 }
  },
  {
    title: "Otha Satti Soru (8D Raw Folk)",
    artist: "Santhosh Narayanan, Aditya RK (Vaazhai)",
    category: "Tamil Gana & Folk",
    features: { tempo: 118, energy: 0.82, danceability: 0.78, valence: 0.7, acousticness: 0.4, calmness: 0.35 }
  },

  // --- 2023 BLOCKBUSTERS ---
  {
    title: "Ranjithame (8D Kuthu)",
    artist: "Thalapathy Vijay, M.M. Manasi, Thaman S (Varisu)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.94, danceability: 0.91, valence: 0.88, acousticness: 0.2, calmness: 0.16 }
  },
  {
    title: "Thee Thalapathy (8D Rage)",
    artist: "Silambarasan TR, Thaman S (Varisu)",
    category: "Tamil High Energy",
    features: { tempo: 120, energy: 0.95, danceability: 0.85, valence: 0.8, acousticness: 0.15, calmness: 0.14 }
  },
  {
    title: "Jimikki Ponnu (8D Dance)",
    artist: "Anirudh Ravichander, Jonita Gandhi, Thaman S (Varisu)",
    category: "Tamil High Energy",
    features: { tempo: 125, energy: 0.9, danceability: 0.89, valence: 0.86, acousticness: 0.25, calmness: 0.2 }
  },
  {
    title: "Soul of Varisu (8D Mother Lullaby)",
    artist: "K.S. Chithra, Thaman S (Varisu)",
    category: "Tamil Ambient Relax",
    features: { tempo: 68, energy: 0.3, danceability: 0.35, valence: 0.45, acousticness: 0.88, calmness: 0.92 }
  },
  {
    title: "Chilla Chilla (8D Adrenaline)",
    artist: "Anirudh Ravichander, Ghibran (Thunivu)",
    category: "Tamil High Energy",
    features: { tempo: 134, energy: 0.95, danceability: 0.88, valence: 0.84, acousticness: 0.18, calmness: 0.15 }
  },
  {
    title: "Kasethan Kadavulada (8D Vibe)",
    artist: "Vaisagh, Manju Warrier, Ghibran (Thunivu)",
    category: "Tamil High Energy",
    features: { tempo: 122, energy: 0.87, danceability: 0.85, valence: 0.82, acousticness: 0.28, calmness: 0.22 }
  },
  {
    title: "Gangstaa (8D Bass Orbit)",
    artist: "Shabir Sulthan, Ghibran (Thunivu)",
    category: "Tamil Movie Hits",
    features: { tempo: 108, energy: 0.89, danceability: 0.8, valence: 0.74, acousticness: 0.2, calmness: 0.25 }
  },
  {
    title: "Bloody Sweet (8D English Trap)",
    artist: "Anirudh Ravichander, Siddharth Basrur (Leo)",
    category: "Tamil Movie Hits",
    features: { tempo: 100, energy: 0.88, danceability: 0.78, valence: 0.72, acousticness: 0.22, calmness: 0.26 }
  },
  {
    title: "Anbenum (8D Romance)",
    artist: "Anirudh Ravichander, Lothika (Leo)",
    category: "Tamil Melodies 8D",
    features: { tempo: 90, energy: 0.52, danceability: 0.6, valence: 0.65, acousticness: 0.68, calmness: 0.7 }
  },
  {
    title: "Lokiverse 2.0 (8D Theme)",
    artist: "Anirudh Ravichander (Leo)",
    category: "Tamil Movie Hits",
    features: { tempo: 112, energy: 0.92, danceability: 0.76, valence: 0.65, acousticness: 0.18, calmness: 0.2 }
  },
  {
    title: "Rathamaarey (8D Father Emotion)",
    artist: "Vishal Mishra, Anirudh Ravichander (Jailer)",
    category: "Tamil Melodies 8D",
    features: { tempo: 76, energy: 0.42, danceability: 0.48, valence: 0.5, acousticness: 0.78, calmness: 0.8 }
  },
  {
    title: "Jujubee (8D Bass Drop)",
    artist: "Dhee, Anirudh Ravichander (Jailer)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.93, danceability: 0.87, valence: 0.82, acousticness: 0.18, calmness: 0.16 }
  },
  {
    title: "Veera Raja Veera (8D Royal Chants)",
    artist: "A.R. Rahman, Shankar Mahadevan, KS Chithra (Ponniyin Selvan 2)",
    category: "Tamil Movie Hits",
    features: { tempo: 105, energy: 0.78, danceability: 0.65, valence: 0.68, acousticness: 0.6, calmness: 0.55 }
  },
  {
    title: "Vannarapettayila (8D Street Vibe)",
    artist: "Sivakarthikeyan, Aditi Shankar, Bharath Sankar (Maaveeran)",
    category: "Tamil Melodies 8D",
    features: { tempo: 102, energy: 0.72, danceability: 0.8, valence: 0.82, acousticness: 0.45, calmness: 0.48 }
  },
  {
    title: "Scene Ah Scene Ah (8D Celebration)",
    artist: "Anirudh Ravichander, Bharath Sankar (Maaveeran)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.92, danceability: 0.9, valence: 0.88, acousticness: 0.2, calmness: 0.18 }
  },
  {
    title: "Adiye (8D Soulful Cry)",
    artist: "Kapil Kapilan, Dhibu Ninan Thomas (Bachelor)",
    category: "Tamil Melodies 8D",
    features: { tempo: 78, energy: 0.48, danceability: 0.55, valence: 0.52, acousticness: 0.75, calmness: 0.78 }
  },
  {
    title: "Dhimu Dhimu (8D Heartfelt)",
    artist: "Sid Sriram, Dhibu Ninan Thomas (Bachelor)",
    category: "Tamil Melodies 8D",
    features: { tempo: 82, energy: 0.5, danceability: 0.58, valence: 0.55, acousticness: 0.72, calmness: 0.75 }
  },
  {
    title: "Theekuchi (8D Raw Western)",
    artist: "Yuvan Shankar Raja, Santhosh Narayanan (Jigarthanda DoubleX)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.91, danceability: 0.86, valence: 0.8, acousticness: 0.22, calmness: 0.2 }
  },
  {
    title: "Maamadura (8D Folk Feast)",
    artist: "Dhee, Santhosh Narayanan (Jigarthanda DoubleX)",
    category: "Tamil High Energy",
    features: { tempo: 136, energy: 0.95, danceability: 0.92, valence: 0.89, acousticness: 0.25, calmness: 0.15 }
  },
  {
    title: "Nenjame Nenjame (8D Flute Love)",
    artist: "Vijay Yesudas, Shakthisree Gopalan, A.R. Rahman (Maamannan)",
    category: "Tamil Melodies 8D",
    features: { tempo: 80, energy: 0.46, danceability: 0.54, valence: 0.6, acousticness: 0.78, calmness: 0.8 }
  },
  {
    title: "Jigu Jigu Rail (8D Folk Melody)",
    artist: "Vadivelu, A.R. Rahman (Maamannan)",
    category: "Tamil Gana & Folk",
    features: { tempo: 112, energy: 0.76, danceability: 0.82, valence: 0.8, acousticness: 0.55, calmness: 0.45 }
  },
  {
    title: "Kangal Edho (8D Tender)",
    artist: "Pradeep Kumar, Karthika Vaidyanathan, Dhibu Ninan Thomas (Chithha)",
    category: "Tamil Melodies 8D",
    features: { tempo: 74, energy: 0.38, danceability: 0.48, valence: 0.5, acousticness: 0.85, calmness: 0.88 }
  },
  {
    title: "Unakku Thaan (8D Breeze)",
    artist: "Santhosh Narayanan, Dhvani Kailas (Chithha)",
    category: "Tamil Melodies 8D",
    features: { tempo: 82, energy: 0.42, danceability: 0.55, valence: 0.58, acousticness: 0.8, calmness: 0.82 }
  },
  {
    title: "Pazhagikkalam (8D Chill Vibe)",
    artist: "Jen Martin (Dada)",
    category: "Tamil Melodies 8D",
    features: { tempo: 92, energy: 0.58, danceability: 0.68, valence: 0.7, acousticness: 0.6, calmness: 0.65 }
  },
  {
    title: "Urugi Urugi (8D Heart Touch)",
    artist: "Anand Aravindakshan, Siddhu Kumar (Joe)",
    category: "Tamil Melodies 8D",
    features: { tempo: 76, energy: 0.45, danceability: 0.5, valence: 0.48, acousticness: 0.82, calmness: 0.84 }
  },

  // --- 2022 BLOCKBUSTERS ---
  {
    title: "Pathala Pathala (8D Local Dance)",
    artist: "Kamal Haasan, Anirudh Ravichander (Vikram)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.95, danceability: 0.92, valence: 0.88, acousticness: 0.22, calmness: 0.15 }
  },
  {
    title: "Once Upon a Time (8D Lore)",
    artist: "Anirudh Ravichander (Vikram)",
    category: "Tamil Movie Hits",
    features: { tempo: 98, energy: 0.84, danceability: 0.72, valence: 0.62, acousticness: 0.3, calmness: 0.35 }
  },
  {
    title: "Wasted (8D Adrenaline Rush)",
    artist: "Anirudh Ravichander (Vikram)",
    category: "Tamil Movie Hits",
    features: { tempo: 130, energy: 0.94, danceability: 0.8, valence: 0.74, acousticness: 0.15, calmness: 0.18 }
  },
  {
    title: "Por Kanda Singam (8D Warrior Soul)",
    artist: "Ravi G, Anirudh Ravichander (Vikram)",
    category: "Tamil Melodies 8D",
    features: { tempo: 72, energy: 0.52, danceability: 0.42, valence: 0.45, acousticness: 0.7, calmness: 0.75 }
  },
  {
    title: "Ponni Nadhi (8D River Chants)",
    artist: "A.R. Rahman, AR Raihanah, Bamba Bakya (Ponniyin Selvan 1)",
    category: "Tamil Movie Hits",
    features: { tempo: 104, energy: 0.82, danceability: 0.75, valence: 0.78, acousticness: 0.48, calmness: 0.45 }
  },
  {
    title: "Chola Chola (8D Victory Roar)",
    artist: "Sathya Prakash, VM Mahalingam, A.R. Rahman (Ponniyin Selvan 1)",
    category: "Tamil High Energy",
    features: { tempo: 124, energy: 0.92, danceability: 0.84, valence: 0.8, acousticness: 0.28, calmness: 0.22 }
  },
  {
    title: "Alaikadal (8D Ocean Serenade)",
    artist: "Antara Nandy, A.R. Rahman (Ponniyin Selvan 1)",
    category: "Tamil Ambient Relax",
    features: { tempo: 65, energy: 0.28, danceability: 0.3, valence: 0.42, acousticness: 0.92, calmness: 0.94 }
  },
  {
    title: "Jolly O Gymkhana (8D Beach Vibe)",
    artist: "Thalapathy Vijay, Anirudh Ravichander (Beast)",
    category: "Tamil High Energy",
    features: { tempo: 122, energy: 0.88, danceability: 0.89, valence: 0.9, acousticness: 0.35, calmness: 0.3 }
  },
  {
    title: "Megham Karukatha (8D Rain Dance)",
    artist: "Dhanush, Anirudh Ravichander (Thiruchitrambalam)",
    category: "Tamil Melodies 8D",
    features: { tempo: 106, energy: 0.74, danceability: 0.84, valence: 0.85, acousticness: 0.5, calmness: 0.55 }
  },
  {
    title: "Thaai Kelavi (8D Village Celebration)",
    artist: "Dhanush, Anirudh Ravichander (Thiruchitrambalam)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.92, danceability: 0.9, valence: 0.87, acousticness: 0.25, calmness: 0.2 }
  },
  {
    title: "Life of Pazham (8D Melancholy)",
    artist: "Anirudh Ravichander (Thiruchitrambalam)",
    category: "Tamil Ambient Relax",
    features: { tempo: 70, energy: 0.35, danceability: 0.4, valence: 0.44, acousticness: 0.85, calmness: 0.88 }
  },
  {
    title: "Bae (8D Romantic Orbit)",
    artist: "Adithya RK, Anirudh Ravichander (Don)",
    category: "Tamil Melodies 8D",
    features: { tempo: 94, energy: 0.65, danceability: 0.74, valence: 0.78, acousticness: 0.52, calmness: 0.6 }
  },
  {
    title: "Private Party (8D Arabic Beats)",
    artist: "Anirudh Ravichander, Jonita Gandhi (Don)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.91, danceability: 0.88, valence: 0.84, acousticness: 0.22, calmness: 0.2 }
  },
  {
    title: "Saachitada (8D Youth Anthem)",
    artist: "Yuvan Shankar Raja (Love Today)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.89, danceability: 0.86, valence: 0.82, acousticness: 0.25, calmness: 0.24 }
  },
  {
    title: "Ennai Vittu (8D Heartbreak)",
    artist: "Sid Sriram, Yuvan Shankar Raja (Love Today)",
    category: "Tamil Melodies 8D",
    features: { tempo: 76, energy: 0.44, danceability: 0.48, valence: 0.45, acousticness: 0.78, calmness: 0.82 }
  },
  {
    title: "Naattu Koothu (8D Oscar Energy)",
    artist: "Rahul Sipligunj, Yazin Nizar, M.M. Keeravaani (RRR)",
    category: "Tamil High Energy",
    features: { tempo: 142, energy: 0.98, danceability: 0.95, valence: 0.92, acousticness: 0.15, calmness: 0.08 }
  },
  {
    title: "Mehabooba (8D Desert Love)",
    artist: "Ananya Bhat, Ravi Basrur (KGF Chapter 2)",
    category: "Tamil Melodies 8D",
    features: { tempo: 92, energy: 0.62, danceability: 0.65, valence: 0.68, acousticness: 0.6, calmness: 0.65 }
  },
  {
    title: "Mudhal Nee Mudivum Nee (8D School Nostalgia)",
    artist: "Sid Sriram, Darbuka Siva (Mudhal Nee Mudivum Nee)",
    category: "Tamil Melodies 8D",
    features: { tempo: 75, energy: 0.42, danceability: 0.52, valence: 0.55, acousticness: 0.84, calmness: 0.86 }
  },

  // --- 2021 BLOCKBUSTERS ---
  {
    title: "Vaathi Raid (8D Bass Rage)",
    artist: "Arivu, Anirudh Ravichander (Master)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.96, danceability: 0.88, valence: 0.82, acousticness: 0.12, calmness: 0.12 }
  },
  {
    title: "Polakattum Para Para (8D Folk Blast)",
    artist: "Santhosh Narayanan, Anirudh Ravichander (Master)",
    category: "Tamil High Energy",
    features: { tempo: 134, energy: 0.94, danceability: 0.91, valence: 0.86, acousticness: 0.22, calmness: 0.15 }
  },
  {
    title: "Chemma Chellame (8D Groovy Love)",
    artist: "Anirudh Ravichander, Jonita Gandhi (Doctor)",
    category: "Tamil Melodies 8D",
    features: { tempo: 104, energy: 0.76, danceability: 0.85, valence: 0.88, acousticness: 0.45, calmness: 0.5 }
  },
  {
    title: "So Baby (8D Classical Fusion)",
    artist: "Anirudh Ravichander, Ananthakrrishnan (Doctor)",
    category: "Tamil Melodies 8D",
    features: { tempo: 96, energy: 0.65, danceability: 0.75, valence: 0.8, acousticness: 0.62, calmness: 0.62 }
  },
  {
    title: "Nenjame (8D Heart Healer)",
    artist: "Anirudh Ravichander (Doctor)",
    category: "Tamil Ambient Relax",
    features: { tempo: 68, energy: 0.32, danceability: 0.38, valence: 0.42, acousticness: 0.88, calmness: 0.9 }
  },
  {
    title: "Manjanathi Puranam (8D Epic Deva)",
    artist: "Deva, Santhosh Narayanan (Karnan)",
    category: "Tamil Gana & Folk",
    features: { tempo: 110, energy: 0.84, danceability: 0.78, valence: 0.72, acousticness: 0.5, calmness: 0.35 }
  },
  {
    title: "Thattaan Thattaan (8D Joyous Flute)",
    artist: "Dhanush, Meenakshi, Santhosh Narayanan (Karnan)",
    category: "Tamil Melodies 8D",
    features: { tempo: 98, energy: 0.68, danceability: 0.76, valence: 0.82, acousticness: 0.65, calmness: 0.6 }
  },
  {
    title: "Meherezylaa (8D Loop Arabic)",
    artist: "Yuvan Shankar Raja, Rizwan (Maanaadu)",
    category: "Tamil High Energy",
    features: { tempo: 120, energy: 0.85, danceability: 0.84, valence: 0.78, acousticness: 0.32, calmness: 0.3 }
  },
  {
    title: "Voice of Bob (8D Time Loop BGM)",
    artist: "Yuvan Shankar Raja (Maanaadu)",
    category: "Tamil Movie Hits",
    features: { tempo: 115, energy: 0.88, danceability: 0.76, valence: 0.65, acousticness: 0.25, calmness: 0.3 }
  },
  {
    title: "Sendumalli (8D Forest Soul)",
    artist: "Ananthu, K.G. Ranjith, Sean Roldan (Jai Bhim)",
    category: "Tamil Melodies 8D",
    features: { tempo: 80, energy: 0.48, danceability: 0.56, valence: 0.6, acousticness: 0.76, calmness: 0.78 }
  },
  {
    title: "Rakita Rakita (8D London Kuthu)",
    artist: "Dhanush, Dhee, Santhosh Narayanan (Jagame Thandhiram)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.95, danceability: 0.92, valence: 0.89, acousticness: 0.22, calmness: 0.15 }
  },
  {
    title: "Bujji (8D Western Tap)",
    artist: "Anirudh Ravichander, Santhosh Narayanan (Jagame Thandhiram)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.88, danceability: 0.88, valence: 0.85, acousticness: 0.3, calmness: 0.25 }
  },
  {
    title: "Nethu (8D Acoustic Love)",
    artist: "Dhanush, Santhosh Narayanan (Jagame Thandhiram)",
    category: "Tamil Ambient Relax",
    features: { tempo: 72, energy: 0.35, danceability: 0.45, valence: 0.52, acousticness: 0.88, calmness: 0.9 }
  },
  {
    title: "Tum Tum (8D Wedding Sensation)",
    artist: "Sri Vardhini, Aditi, Thaman S (Enemy)",
    category: "Tamil High Energy",
    features: { tempo: 124, energy: 0.89, danceability: 0.92, valence: 0.91, acousticness: 0.38, calmness: 0.26 }
  },

  // --- 2020 BLOCKBUSTERS ---
  {
    title: "Usurey (8D Heart Touch)",
    artist: "G.V. Prakash Kumar (Soorarai Pottru)",
    category: "Tamil Melodies 8D",
    features: { tempo: 75, energy: 0.4, danceability: 0.45, valence: 0.48, acousticness: 0.84, calmness: 0.86 }
  },
  {
    title: "Chumma Kizhi (8D Thalaivar Celebration)",
    artist: "S.P. Balasubrahmanyam, Anirudh Ravichander (Darbar)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.95, danceability: 0.92, valence: 0.9, acousticness: 0.2, calmness: 0.15 }
  },
  {
    title: "Dhummu Dhookku (8D Brass Beat)",
    artist: "Anirudh Ravichander (Darbar)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.93, danceability: 0.89, valence: 0.85, acousticness: 0.18, calmness: 0.16 }
  },
  {
    title: "Chill Bro (8D Youth Anthem)",
    artist: "Dhanush, Vivek-Mervin (Pattas)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.9, danceability: 0.9, valence: 0.88, acousticness: 0.24, calmness: 0.2 }
  },
  {
    title: "Morrakka (8D Traditional Energy)",
    artist: "Anirudh Ravichander, Vivek-Mervin (Pattas)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.94, danceability: 0.91, valence: 0.87, acousticness: 0.26, calmness: 0.18 }
  },
  {
    title: "Kadhaippoma (8D Romantic Soul)",
    artist: "Sid Sriram, Leon James (Oh My Kadavule)",
    category: "Tamil Melodies 8D",
    features: { tempo: 84, energy: 0.52, danceability: 0.62, valence: 0.68, acousticness: 0.72, calmness: 0.74 }
  },

  // --- 2019 BLOCKBUSTERS ---
  {
    title: "Verithanam (8D Football Beat)",
    artist: "Thalapathy Vijay, A.R. Rahman (Bigil)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.96, danceability: 0.93, valence: 0.9, acousticness: 0.18, calmness: 0.14 }
  },
  {
    title: "Singappenney (8D Women Anthem)",
    artist: "A.R. Rahman, Shashaa Tirupati (Bigil)",
    category: "Tamil Melodies 8D",
    features: { tempo: 96, energy: 0.78, danceability: 0.68, valence: 0.75, acousticness: 0.45, calmness: 0.55 }
  },
  {
    title: "Unakaga (8D Soulful Duet)",
    artist: "Sreekanth Hariharan, Madhura Dhara Kavi, A.R. Rahman (Bigil)",
    category: "Tamil Melodies 8D",
    features: { tempo: 80, energy: 0.46, danceability: 0.54, valence: 0.62, acousticness: 0.76, calmness: 0.8 }
  },
  {
    title: "Bigil Bigil (8D Roar Theme)",
    artist: "A.R. Rahman (Bigil)",
    category: "Tamil Movie Hits",
    features: { tempo: 114, energy: 0.92, danceability: 0.78, valence: 0.72, acousticness: 0.18, calmness: 0.2 }
  },
  {
    title: "Vaaney Vaaney (8D Romantic Heaven)",
    artist: "Hariharan, Shreya Ghoshal, D. Imman (Viswasam)",
    category: "Tamil Melodies 8D",
    features: { tempo: 82, energy: 0.5, danceability: 0.56, valence: 0.65, acousticness: 0.74, calmness: 0.78 }
  },
  {
    title: "Danga Danga (8D Village Fest)",
    artist: "Senthil Ganesh, Rajalakshmi, D. Imman (Viswasam)",
    category: "Tamil Gana & Folk",
    features: { tempo: 136, energy: 0.95, danceability: 0.94, valence: 0.92, acousticness: 0.28, calmness: 0.14 }
  },
  {
    title: "Polladha Boomi (8D Raw Rural)",
    artist: "Dhanush, Ken Karunas, G.V. Prakash Kumar (Asuran)",
    category: "Tamil Gana & Folk",
    features: { tempo: 120, energy: 0.86, danceability: 0.8, valence: 0.72, acousticness: 0.45, calmness: 0.3 }
  },
  {
    title: "Kathari Poovazhagi (8D Village Romance)",
    artist: "Velmurugan, Rajalakshmi, G.V. Prakash Kumar (Asuran)",
    category: "Tamil Gana & Folk",
    features: { tempo: 124, energy: 0.89, danceability: 0.86, valence: 0.84, acousticness: 0.4, calmness: 0.28 }
  },
  {
    title: "Ellu Vaya Pookalaye (8D Emotional Tear)",
    artist: "Saindhavi, G.V. Prakash Kumar (Asuran)",
    category: "Tamil Ambient Relax",
    features: { tempo: 68, energy: 0.32, danceability: 0.35, valence: 0.38, acousticness: 0.92, calmness: 0.94 }
  },
  {
    title: "Blood Bath (8D Blood Rage)",
    artist: "Arunraja Kamaraj, G.V. Prakash Kumar (Asuran)",
    category: "Tamil Movie Hits",
    features: { tempo: 135, energy: 0.98, danceability: 0.75, valence: 0.6, acousticness: 0.1, calmness: 0.08 }
  },
  {
    title: "Marana Mass (8D Thalaivar Entry)",
    artist: "S.P. Balasubrahmanyam, Anirudh Ravichander (Petta)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.97, danceability: 0.93, valence: 0.91, acousticness: 0.16, calmness: 0.12 }
  },
  {
    title: "Petta Paraak (8D War Chant)",
    artist: "Anirudh Ravichander (Petta)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.94, danceability: 0.85, valence: 0.8, acousticness: 0.18, calmness: 0.16 }
  },
  {
    title: "Ullaallaa (8D Retro Fest)",
    artist: "Nakash Aziz, Inno Genga, Anirudh Ravichander (Petta)",
    category: "Tamil High Energy",
    features: { tempo: 124, energy: 0.9, danceability: 0.91, valence: 0.92, acousticness: 0.25, calmness: 0.2 }
  },
  {
    title: "Ilamai Thirumbudhe (8D Breezy Vintage)",
    artist: "Anirudh Ravichander (Petta)",
    category: "Tamil Melodies 8D",
    features: { tempo: 92, energy: 0.6, danceability: 0.7, valence: 0.76, acousticness: 0.62, calmness: 0.68 }
  },
  {
    title: "Paisa Note (8D Trap Dance)",
    artist: "Hiphop Tamizha (Comali)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.9, danceability: 0.92, valence: 0.85, acousticness: 0.2, calmness: 0.22 }
  },

  // --- 2018 BLOCKBUSTERS ---
  {
    title: "Life of Ram (8D Solo Travel)",
    artist: "Pradeep Kumar, Govind Vasantha (96)",
    category: "Tamil Ambient Relax",
    features: { tempo: 82, energy: 0.44, danceability: 0.52, valence: 0.58, acousticness: 0.82, calmness: 0.85 }
  },
  {
    title: "Thaabangale (8D Acoustic Whisper)",
    artist: "Chinmayi Sripaada, Pradeep Kumar, Govind Vasantha (96)",
    category: "Tamil Ambient Relax",
    features: { tempo: 70, energy: 0.32, danceability: 0.38, valence: 0.42, acousticness: 0.9, calmness: 0.92 }
  },
  {
    title: "Anthaathi (8D Poetic Climax)",
    artist: "Chinmayi Sripaada, Govind Vasantha (96)",
    category: "Tamil Melodies 8D",
    features: { tempo: 74, energy: 0.45, danceability: 0.44, valence: 0.48, acousticness: 0.85, calmness: 0.82 }
  },
  {
    title: "Simtaangaran (8D Mad Folk)",
    artist: "Bamba Bakya, Vipin Aneja, A.R. Rahman (Sarkar)",
    category: "Tamil High Energy",
    features: { tempo: 122, energy: 0.88, danceability: 0.87, valence: 0.82, acousticness: 0.35, calmness: 0.25 }
  },
  {
    title: "Top Tucker (8D Rock Anthem)",
    artist: "Mohit Chauhan, A.R. Rahman (Sarkar)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.92, danceability: 0.84, valence: 0.78, acousticness: 0.18, calmness: 0.2 }
  },
  {
    title: "OMG Ponnu (8D Technopop)",
    artist: "Sid Sriram, Jonita Gandhi, A.R. Rahman (Sarkar)",
    category: "Tamil High Energy",
    features: { tempo: 120, energy: 0.85, danceability: 0.86, valence: 0.84, acousticness: 0.3, calmness: 0.28 }
  },
  {
    title: "Kaarkuzhal Kadavaiye (8D Classical Vibe)",
    artist: "Sriram Parthasarathy, Santhosh Narayanan (Vada Chennai)",
    category: "Tamil Melodies 8D",
    features: { tempo: 86, energy: 0.52, danceability: 0.58, valence: 0.65, acousticness: 0.72, calmness: 0.75 }
  },
  {
    title: "Ennadi Maayavi Nee (8D Soul Ache)",
    artist: "Sid Sriram, Santhosh Narayanan (Vada Chennai)",
    category: "Tamil Melodies 8D",
    features: { tempo: 78, energy: 0.48, danceability: 0.5, valence: 0.5, acousticness: 0.8, calmness: 0.8 }
  },
  {
    title: "Sandhanatha (8D Gana Beat)",
    artist: "Ka Ka Balachander, Gana Bala, Santhosh Narayanan (Vada Chennai)",
    category: "Tamil Gana & Folk",
    features: { tempo: 130, energy: 0.92, danceability: 0.9, valence: 0.85, acousticness: 0.3, calmness: 0.2 }
  },
  {
    title: "Kalyana Vayasu (8D Comical Groove)",
    artist: "Anirudh Ravichander (Kolamaavu Kokila)",
    category: "Tamil High Energy",
    features: { tempo: 118, energy: 0.84, danceability: 0.88, valence: 0.89, acousticness: 0.32, calmness: 0.3 }
  },
  {
    title: "Karuppi (8D Heartfelt Elegy)",
    artist: "Santhosh Narayanan (Pariyerum Perumal)",
    category: "Tamil Ambient Relax",
    features: { tempo: 66, energy: 0.3, danceability: 0.32, valence: 0.32, acousticness: 0.92, calmness: 0.94 }
  },
  {
    title: "Endhira Logathu Sundariye (8D Sci-Fi Love)",
    artist: "Sid Sriram, Shashaa Tirupati, A.R. Rahman (2.0)",
    category: "Tamil Melodies 8D",
    features: { tempo: 108, energy: 0.75, danceability: 0.78, valence: 0.8, acousticness: 0.4, calmness: 0.5 }
  },
  {
    title: "High On Love (8D Euphoria)",
    artist: "Sid Sriram, Yuvan Shankar Raja (Pyaar Prema Kaadhal)",
    category: "Tamil Melodies 8D",
    features: { tempo: 96, energy: 0.72, danceability: 0.78, valence: 0.82, acousticness: 0.48, calmness: 0.55 }
  },
  {
    title: "Rowdy Baby (8D Global Dance Sensation)",
    artist: "Dhanush, Dhee, Yuvan Shankar Raja (Maari 2)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.97, danceability: 0.96, valence: 0.94, acousticness: 0.2, calmness: 0.1 }
  },

  // --- 2017 BLOCKBUSTERS ---
  {
    title: "Aalaporan Thamizhan (8D Pride Anthem)",
    artist: "Kailash Kher, Sathya Prakash, A.R. Rahman (Mersal)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.95, danceability: 0.88, valence: 0.9, acousticness: 0.3, calmness: 0.18 }
  },
  {
    title: "Mersal Arasan (8D Kuthu Storm)",
    artist: "G.V. Prakash Kumar, Naresh Iyer, A.R. Rahman (Mersal)",
    category: "Tamil High Energy",
    features: { tempo: 134, energy: 0.96, danceability: 0.93, valence: 0.92, acousticness: 0.22, calmness: 0.12 }
  },
  {
    title: "Maacho (8D Chic Dance)",
    artist: "Sid Sriram, Shweta Mohan, A.R. Rahman (Mersal)",
    category: "Tamil Melodies 8D",
    features: { tempo: 104, energy: 0.78, danceability: 0.82, valence: 0.84, acousticness: 0.4, calmness: 0.45 }
  },
  {
    title: "Karuppu Vellai (8D Mafia Soul)",
    artist: "Sam C.S., Anirudh Ravichander (Vikram Vedha)",
    category: "Tamil Movie Hits",
    features: { tempo: 112, energy: 0.92, danceability: 0.76, valence: 0.68, acousticness: 0.2, calmness: 0.25 }
  },
  {
    title: "Tasakku Tasakku (8D Celebration)",
    artist: "Mukesh, M.L.R. Karthikeyan, Sam C.S. (Vikram Vedha)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.93, danceability: 0.9, valence: 0.88, acousticness: 0.25, calmness: 0.18 }
  },
  {
    title: "Yaanji (8D Breeze of Romance)",
    artist: "Anirudh Ravichander, Shakthisree Gopalan, Sam C.S. (Vikram Vedha)",
    category: "Tamil Melodies 8D",
    features: { tempo: 86, energy: 0.54, danceability: 0.64, valence: 0.72, acousticness: 0.65, calmness: 0.72 }
  },
  {
    title: "Karuthavanlaam Galeejam (8D Slum Pride)",
    artist: "Anirudh Ravichander (Velaikkaran)",
    category: "Tamil High Energy",
    features: { tempo: 134, energy: 0.95, danceability: 0.92, valence: 0.89, acousticness: 0.22, calmness: 0.15 }
  },
  {
    title: "Iraiva (8D Dual Beat)",
    artist: "Anirudh Ravichander, Jonita Gandhi (Velaikkaran)",
    category: "Tamil High Energy",
    features: { tempo: 122, energy: 0.88, danceability: 0.8, valence: 0.75, acousticness: 0.28, calmness: 0.28 }
  },
  {
    title: "Sevatha Pulla (8D Desert Melody)",
    artist: "Ghibran, K.G. Ranjith (Theeran Adhigaaram Ondru)",
    category: "Tamil Melodies 8D",
    features: { tempo: 92, energy: 0.68, danceability: 0.72, valence: 0.76, acousticness: 0.55, calmness: 0.6 }
  },
  {
    title: "Thangachi Song (8D Sister Anthem)",
    artist: "Ka Ka Balachander, Santhosh Narayanan (Meyaadha Maan)",
    category: "Tamil Gana & Folk",
    features: { tempo: 128, energy: 0.9, danceability: 0.88, valence: 0.88, acousticness: 0.32, calmness: 0.22 }
  },
  {
    title: "Bale Bale Bale (8D Royal Roar)",
    artist: "Daler Mehndi, M.M. Keeravaani (Bahubali 2)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.96, danceability: 0.85, valence: 0.85, acousticness: 0.25, calmness: 0.16 }
  },

  // --- 2016 BLOCKBUSTERS ---
  {
    title: "Ulagam Oruvanukka (8D Thalaivar Entrance)",
    artist: "Ananthu, Santhosh Narayanan, Gana Bala (Kabali)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.94, danceability: 0.88, valence: 0.85, acousticness: 0.24, calmness: 0.18 }
  },
  {
    title: "Senjitaley (8D Charming Groove)",
    artist: "Anirudh Ravichander (Remo)",
    category: "Tamil Melodies 8D",
    features: { tempo: 110, energy: 0.82, danceability: 0.86, valence: 0.88, acousticness: 0.35, calmness: 0.4 }
  },
  {
    title: "Sirikkadhey (8D Acoustic Sparkle)",
    artist: "Anirudh Ravichander, Arjun Kanungo (Remo)",
    category: "Tamil Melodies 8D",
    features: { tempo: 98, energy: 0.68, danceability: 0.74, valence: 0.78, acousticness: 0.55, calmness: 0.6 }
  },
  {
    title: "Jithu Jilladi (8D Police Kuthu)",
    artist: "Deva, G.V. Prakash Kumar (Theri)",
    category: "Tamil High Energy",
    features: { tempo: 136, energy: 0.96, danceability: 0.93, valence: 0.9, acousticness: 0.22, calmness: 0.12 }
  },
  {
    title: "En Jeevan (8D Classical Tear)",
    artist: "Hariharan, Vaikom Vijayalakshmi, G.V. Prakash Kumar (Theri)",
    category: "Tamil Melodies 8D",
    features: { tempo: 76, energy: 0.45, danceability: 0.48, valence: 0.52, acousticness: 0.8, calmness: 0.82 }
  },
  {
    title: "Chella Kutti (8D Duet)",
    artist: "Thalapathy Vijay, Neeti Mohan, G.V. Prakash Kumar (Theri)",
    category: "Tamil High Energy",
    features: { tempo: 122, energy: 0.88, danceability: 0.88, valence: 0.9, acousticness: 0.3, calmness: 0.25 }
  },
  {
    title: "Mei Nigara (8D Funky Time)",
    artist: "Sid Sriram, Sanah Moidutty, A.R. Rahman (24)",
    category: "Tamil Melodies 8D",
    features: { tempo: 112, energy: 0.8, danceability: 0.82, valence: 0.85, acousticness: 0.38, calmness: 0.42 }
  },
  {
    title: "Ey Sandakara (8D Champion Vibe)",
    artist: "Dhee, Santhosh Narayanan (Irudhi Suttru)",
    category: "Tamil Melodies 8D",
    features: { tempo: 90, energy: 0.64, danceability: 0.72, valence: 0.76, acousticness: 0.6, calmness: 0.65 }
  },
  {
    title: "Ei Suzhali (8D Folk Whirlwind)",
    artist: "Vijaynarain, Santhosh Narayanan (Kodi)",
    category: "Tamil Melodies 8D",
    features: { tempo: 84, energy: 0.56, danceability: 0.65, valence: 0.7, acousticness: 0.7, calmness: 0.72 }
  },
  {
    title: "Thalli Pogathey (8D Timeless Emotion)",
    artist: "Sid Sriram, Aparna Narayanan, A.R. Rahman (AYM)",
    category: "Tamil Melodies 8D",
    features: { tempo: 72, energy: 0.5, danceability: 0.45, valence: 0.48, acousticness: 0.78, calmness: 0.82 }
  },
  {
    title: "Rasaali (8D Highway Duet)",
    artist: "Sathya Prakash, Shashaa Tirupati, A.R. Rahman (AYM)",
    category: "Tamil Melodies 8D",
    features: { tempo: 96, energy: 0.72, danceability: 0.75, valence: 0.82, acousticness: 0.52, calmness: 0.58 }
  },

  // --- 2015 BLOCKBUSTERS ---
  {
    title: "Dheerane (8D Majestic)",
    artist: "Ramya Behara, Deepu, M.M. Keeravaani (Baahubali)",
    category: "Tamil Movie Hits",
    features: { tempo: 94, energy: 0.72, danceability: 0.6, valence: 0.65, acousticness: 0.62, calmness: 0.6 }
  },
  {
    title: "Siva Sivaya Potri (8D Holy Chants)",
    artist: "Vaikom Vijayalakshmi, M.M. Keeravaani (Baahubali)",
    category: "Tamil Movie Hits",
    features: { tempo: 108, energy: 0.88, danceability: 0.68, valence: 0.6, acousticness: 0.55, calmness: 0.45 }
  },
  {
    title: "Theemai Dhaan Vellum (8D Villain Masterpiece)",
    artist: "Hiphop Tamizha, Arvind Swamy (Thani Oruvan)",
    category: "Tamil Movie Hits",
    features: { tempo: 120, energy: 0.94, danceability: 0.8, valence: 0.65, acousticness: 0.15, calmness: 0.2 }
  },
  {
    title: "Kannala Kannala (8D Love Code)",
    artist: "Kaushik Krish, Padmalatha, Hiphop Tamizha (Thani Oruvan)",
    category: "Tamil Melodies 8D",
    features: { tempo: 88, energy: 0.62, danceability: 0.7, valence: 0.76, acousticness: 0.55, calmness: 0.65 }
  },
  {
    title: "Mersalaayiten (8D Street Beat)",
    artist: "Anirudh Ravichander, Neeti Mohan, A.R. Rahman (I)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.94, danceability: 0.92, valence: 0.88, acousticness: 0.2, calmness: 0.18 }
  },
  {
    title: "Ennodu Nee Irundhaal (8D Power Ballad)",
    artist: "Sid Sriram, Sunitha Sarathy, A.R. Rahman (I)",
    category: "Tamil Melodies 8D",
    features: { tempo: 74, energy: 0.58, danceability: 0.45, valence: 0.48, acousticness: 0.72, calmness: 0.76 }
  },
  {
    title: "Pookkalae Sattru Oyivedungal (8D Blossom)",
    artist: "Haricharan, Shreya Ghoshal, A.R. Rahman (I)",
    category: "Tamil Melodies 8D",
    features: { tempo: 82, energy: 0.5, danceability: 0.55, valence: 0.68, acousticness: 0.75, calmness: 0.8 }
  },
  {
    title: "Yennai Maatrum Kadhale (8D Tender Soul)",
    artist: "Sid Sriram, Anirudh Ravichander (Naanum Rowdy Dhaan)",
    category: "Tamil Melodies 8D",
    features: { tempo: 80, energy: 0.52, danceability: 0.58, valence: 0.65, acousticness: 0.72, calmness: 0.75 }
  },
  {
    title: "Varava Varava (8D Rowdy Swagger)",
    artist: "Anirudh Ravichander, Vignesh Shivan (Naanum Rowdy Dhaan)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.92, danceability: 0.88, valence: 0.85, acousticness: 0.2, calmness: 0.18 }
  },
  {
    title: "Danga Maari Oodhari (8D Iconic Gana)",
    artist: "Dhanush, Marana Gana Viji, Harris Jayaraj (Anegan)",
    category: "Tamil High Energy",
    features: { tempo: 134, energy: 0.96, danceability: 0.94, valence: 0.92, acousticness: 0.22, calmness: 0.12 }
  },
  {
    title: "Mental Manadhil (8D Fresh Youth)",
    artist: "A.R. Rahman, Jonita Gandhi (OK Kanmani)",
    category: "Tamil Melodies 8D",
    features: { tempo: 124, energy: 0.85, danceability: 0.88, valence: 0.9, acousticness: 0.35, calmness: 0.3 }
  },
  {
    title: "Aye Sinamika (8D Breeze of Romance)",
    artist: "Karthik, A.R. Rahman (OK Kanmani)",
    category: "Tamil Melodies 8D",
    features: { tempo: 92, energy: 0.62, danceability: 0.72, valence: 0.82, acousticness: 0.6, calmness: 0.68 }
  },
  {
    title: "Parandhu Sella Vaa (8D Flight of Love)",
    artist: "Karthik, Shashaa Tirupati, A.R. Rahman (OK Kanmani)",
    category: "Tamil Ambient Relax",
    features: { tempo: 68, energy: 0.35, danceability: 0.4, valence: 0.55, acousticness: 0.85, calmness: 0.9 }
  },

  // --- 2014 BLOCKBUSTERS ---
  {
    title: "Aathi (8D Passionate Beat)",
    artist: "Vishal Dadlani, Anirudh Ravichander (Kaththi)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.95, danceability: 0.89, valence: 0.88, acousticness: 0.18, calmness: 0.15 }
  },
  {
    title: "Selfie Pulla (8D Viral Sensation)",
    artist: "Thalapathy Vijay, Sunidhi Chauhan, Anirudh Ravichander (Kaththi)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.96, danceability: 0.94, valence: 0.92, acousticness: 0.16, calmness: 0.12 }
  },
  {
    title: "Pakkam Vanthu (8D Electro Rap)",
    artist: "Anirudh Ravichander, Hiphop Tamizha (Kaththi)",
    category: "Tamil High Energy",
    features: { tempo: 122, energy: 0.88, danceability: 0.85, valence: 0.8, acousticness: 0.22, calmness: 0.24 }
  },
  {
    title: "Sword of Kaththi (8D Cult Theme)",
    artist: "Anirudh Ravichander (Kaththi)",
    category: "Tamil Movie Hits",
    features: { tempo: 115, energy: 0.92, danceability: 0.75, valence: 0.65, acousticness: 0.15, calmness: 0.2 }
  },
  {
    title: "Udhungada Sangu (8D Graduate Anthem)",
    artist: "Anirudh Ravichander (VIP)",
    category: "Tamil High Energy",
    features: { tempo: 132, energy: 0.95, danceability: 0.92, valence: 0.89, acousticness: 0.2, calmness: 0.15 }
  },
  {
    title: "What a Karuvad (8D Folk Fun)",
    artist: "Dhanush, Anirudh Ravichander (VIP)",
    category: "Tamil High Energy",
    features: { tempo: 126, energy: 0.91, danceability: 0.9, valence: 0.9, acousticness: 0.25, calmness: 0.2 }
  },
  {
    title: "Amma Amma (8D Sacred Tear)",
    artist: "Dhanush, S. Janaki, Anirudh Ravichander (VIP)",
    category: "Tamil Ambient Relax",
    features: { tempo: 65, energy: 0.28, danceability: 0.3, valence: 0.35, acousticness: 0.94, calmness: 0.95 }
  },
  {
    title: "Velai Illa Pattadhaari Theme 8D",
    artist: "Anirudh Ravichander (VIP)",
    category: "Tamil Movie Hits",
    features: { tempo: 110, energy: 0.9, danceability: 0.75, valence: 0.7, acousticness: 0.2, calmness: 0.25 }
  },
  {
    title: "Ding Dong (8D Mad Western)",
    artist: "Arunraja Kamaraj, Santhosh Narayanan (Jigarthanda)",
    category: "Tamil High Energy",
    features: { tempo: 130, energy: 0.92, danceability: 0.88, valence: 0.82, acousticness: 0.25, calmness: 0.2 }
  },
  {
    title: "Kannamma (8D Flute Soul)",
    artist: "Rita, Anthony Daasan, Santhosh Narayanan (Jigarthanda)",
    category: "Tamil Melodies 8D",
    features: { tempo: 84, energy: 0.52, danceability: 0.62, valence: 0.7, acousticness: 0.72, calmness: 0.75 }
  },
  {
    title: "Naan Nee (8D Gentle Rain)",
    artist: "Shakthisree Gopalan, Dhee, Santhosh Narayanan (Madras)",
    category: "Tamil Melodies 8D",
    features: { tempo: 80, energy: 0.44, danceability: 0.52, valence: 0.58, acousticness: 0.8, calmness: 0.84 }
  },
  {
    title: "Open the Tasmac (8D Celebration)",
    artist: "Deva, Anirudh Ravichander (Maan Karate)",
    category: "Tamil High Energy",
    features: { tempo: 134, energy: 0.96, danceability: 0.94, valence: 0.92, acousticness: 0.2, calmness: 0.12 }
  },
  {
    title: "Darling Dambakku (8D Funky Kuthu)",
    artist: "Benny Dayal, Sunidhi Chauhan, Anirudh Ravichander (Maan Karate)",
    category: "Tamil High Energy",
    features: { tempo: 128, energy: 0.93, danceability: 0.91, valence: 0.9, acousticness: 0.22, calmness: 0.16 }
  },

  // --- CONTENT CREATORS, GANA & VIRAL INDEPENDENT SINGLES ---
  {
    title: "Jorthaale (8D Gana Sensation)",
    artist: "Asal Kolaar, OFRO",
    category: "Tamil Indie & Creators",
    features: { tempo: 126, energy: 0.93, danceability: 0.94, valence: 0.9, acousticness: 0.18, calmness: 0.16 }
  },
  {
    title: "Orasaadha (8D Madras Gig Indie)",
    artist: "Vivek-Mervin (Madras Gig)",
    category: "Tamil Indie & Creators",
    features: { tempo: 104, energy: 0.78, danceability: 0.86, valence: 0.88, acousticness: 0.42, calmness: 0.48 }
  },
  {
    title: "Kanna Veesi (8D Indie Romance)",
    artist: "Rahul Raj (Madras Gig)",
    category: "Tamil Indie & Creators",
    features: { tempo: 94, energy: 0.62, danceability: 0.72, valence: 0.78, acousticness: 0.58, calmness: 0.62 }
  },
  {
    title: "Gandhari (8D Modern Dance)",
    artist: "Sudharshan Ashok, Keerthi Pandian",
    category: "Tamil Indie & Creators",
    features: { tempo: 122, energy: 0.88, danceability: 0.9, valence: 0.84, acousticness: 0.25, calmness: 0.25 }
  },
  {
    title: "Sandakaari (8D Soul Groove)",
    artist: "Dhee, Santhosh Narayanan (Madras Gig 2)",
    category: "Tamil Indie & Creators",
    features: { tempo: 96, energy: 0.68, danceability: 0.76, valence: 0.78, acousticness: 0.55, calmness: 0.6 }
  },
  {
    title: "Dhanda Kaanu (8D Raw Gana)",
    artist: "Gana Stephen, Asal Kolaar",
    category: "Tamil Gana & Folk",
    features: { tempo: 132, energy: 0.95, danceability: 0.93, valence: 0.89, acousticness: 0.22, calmness: 0.15 }
  },
  {
    title: "Chennai City Gangsta (8D Cult Rap)",
    artist: "Anirudh Ravichander, Hard Kaur, Hiphop Tamizha",
    category: "Tamil High Energy",
    features: { tempo: 125, energy: 0.92, danceability: 0.88, valence: 0.85, acousticness: 0.2, calmness: 0.2 }
  },
  {
    title: "Don'u Don'u Don'u (8D Flirtatious Vibe)",
    artist: "Anirudh Ravichander, Alisha Thomas (Maari)",
    category: "Tamil High Energy",
    features: { tempo: 120, energy: 0.86, danceability: 0.88, valence: 0.9, acousticness: 0.3, calmness: 0.26 }
  },
  {
    title: "Bagulu Vodayum Dagulu Mari (8D Mass Gana)",
    artist: "Anirudh Ravichander, Dhanush (Maari)",
    category: "Tamil Gana & Folk",
    features: { tempo: 134, energy: 0.96, danceability: 0.94, valence: 0.92, acousticness: 0.22, calmness: 0.12 }
  },
  {
    title: "Vaadi En Machiniye (8D Funky Pop)",
    artist: "Hiphop Tamizha",
    category: "Tamil Indie & Creators",
    features: { tempo: 122, energy: 0.88, danceability: 0.88, valence: 0.86, acousticness: 0.28, calmness: 0.24 }
  }
];

function buildFeatureVector(f) {
  const normTempo = Math.min(1, Math.max(0, (f.tempo - 50) / 130));
  const spectralCentroid = 800 + Math.round(f.energy * 2800);
  const spectralRolloff = 1400 + Math.round(f.energy * 4600);
  const spectralContrast = 0.3 + f.energy * 0.45;
  const zeroCrossingRate = 0.03 + f.energy * 0.055;
  const vector = [
    parseFloat(normTempo.toFixed(4)),
    parseFloat(f.energy.toFixed(4)),
    parseFloat(f.danceability.toFixed(4)),
    parseFloat(f.valence.toFixed(4)),
    parseFloat(f.acousticness.toFixed(4)),
    parseFloat((spectralCentroid / 5000).toFixed(4)),
    parseFloat(spectralContrast.toFixed(4)),
    parseFloat((zeroCrossingRate / 0.1).toFixed(4)),
    0.85,
    parseFloat(f.calmness.toFixed(4)),
  ];

  return {
    tempo: f.tempo,
    energy: f.energy,
    danceability: f.danceability,
    valence: f.valence,
    acousticness: f.acousticness,
    spectralCentroid,
    spectralRolloff,
    spectralContrast,
    zeroCrossingRate,
    calmness: f.calmness,
    vector
  };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
  console.log("Connected to MongoDB.");

  // 1. Ensure new categories exist
  for (const catData of newCategories) {
    const existing = await Category.findOne({ name: catData.name });
    if (!existing) {
      await Category.create(catData);
      console.log(`✨ Created Category: "${catData.name}"`);
    }
  }

  console.log(`\nProcessing ${rawTrackCatalog.length} curated songs from 2014-2024 & creators...`);

  let addedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < rawTrackCatalog.length; i++) {
    const item = rawTrackCatalog[i];
    const cleaned = cleanTitle(item.title);
    const movie = extractMovie(item.artist);

    // Check if song already exists in MongoDB
    const regexPattern = new RegExp(`^${cleaned.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}`, "i");
    let existingSong = await Song.findOne({ title: regexPattern });

    // Prepare JioSaavn Queries
    const queries = [];
    if (movie) queries.push(`${cleaned} ${movie}`);
    queries.push(`${cleaned} Tamil`);
    queries.push(cleaned);

    let bestResult = null;
    for (const q of queries) {
      const results = await searchSaavn(q);
      if (results && results.length > 0) {
        bestResult = pickBestResult(results, cleaned);
        if (bestResult) break;
      }
      await sleep(40);
    }

    let realStream = null;
    let realArtwork = item.features.calmness > 0.6
      ? "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60"
      : "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60";
    let realDuration = "04:30";

    if (bestResult && bestResult.encrypted_media_url) {
      realStream = decryptMediaUrl(bestResult.encrypted_media_url);
      if (bestResult.image) {
        realArtwork = bestResult.image.replace("150x150.jpg", "500x500.jpg");
      }
      if (bestResult.more_info?.duration) {
        realDuration = formatDuration(bestResult.more_info.duration);
      }
    }

    if (!realStream) {
      realStream = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    }

    const featureObj = buildFeatureVector(item.features);

    if (existingSong) {
      // Update with authentic stream and features if needed
      existingSong.audioUrl = realStream;
      existingSong.imageUrl = realArtwork;
      existingSong.duration = realDuration;
      existingSong.category = item.category;
      existingSong.audioFeatures = featureObj;
      await existingSong.save();
      updatedCount++;
      console.log(`[${i + 1}/${rawTrackCatalog.length}] 🔄 Updated: "${item.title}" [${realDuration}]`);
    } else {
      // Create new song record
      await Song.create({
        title: item.title,
        artist: item.artist,
        category: item.category,
        audioUrl: realStream,
        imageUrl: realArtwork,
        duration: realDuration,
        is8D: true,
        audioFeatures: featureObj
      });
      addedCount++;
      console.log(`[${i + 1}/${rawTrackCatalog.length}] 🌟 Added New: "${item.title}" -> "${bestResult?.song || 'OK'}" (${bestResult?.album || ''}) [${realDuration}]`);
    }

    await sleep(60);
  }

  const totalSongs = await Song.countDocuments();
  console.log("\n============================================================");
  console.log(`🎉 Seeding Complete!`);
  console.log(`   New Songs Added: ${addedCount}`);
  console.log(`   Existing Songs Updated: ${updatedCount}`);
  console.log(`   Total Songs in Database: ${totalSongs}`);
  console.log("============================================================");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
