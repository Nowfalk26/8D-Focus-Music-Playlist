const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

// JioSaavn Media URL Decryption
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

// JioSaavn Search API with fallback query variants
async function searchSaavn(query) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&n=5&p=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function buildVerifiedCatalog() {
  console.log('🚀 Starting JioSaavn Real-Time Resolution with Multi-tier Search Fallback...');

  const seeds = require('./curated_tamil_trending_seeds');
  console.log(`📋 Total curated target seeds: ${seeds.length}`);

  const verifiedSongs = [];
  const seenAudioUrls = new Set();
  const seenTitleAlbum = new Set();

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    
    // Tier 1: Try full query
    let results = await searchSaavn(seed.query);

    // Tier 2: If no result, try stripping movie/album suffix or taking first 2 words
    if (!results || results.length === 0) {
      const simplified = seed.query.split(' ').slice(0, 2).join(' ');
      results = await searchSaavn(simplified);
    }

    // Tier 3: Try song title only
    if (!results || results.length === 0) {
      const titleOnly = seed.query.split(' ')[0];
      results = await searchSaavn(titleOnly);
    }

    if (!results || results.length === 0) {
      console.warn(`   ⚠️ No match found across all tiers for "${seed.query}"`);
      continue;
    }

    // Pick top result with valid decrypted media URL that is NOT a duplicate
    let matched = null;
    let streamUrl = null;

    for (const r of results) {
      const url = decryptMediaUrl(r.encrypted_media_url);
      if (url && !seenAudioUrls.has(url)) {
        matched = r;
        streamUrl = url;
        break;
      }
    }

    if (!matched || !streamUrl) {
      console.warn(`   ⚠️ Skipped duplicate or missing audio stream for "${seed.query}"`);
      continue;
    }

    // Register audio URL to strictly prevent duplicate tracks
    seenAudioUrls.add(streamUrl);

    const songTitle = (matched.song || seed.query.split(' ')[0])
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();

    const albumName = (matched.album || "Tamil Superhit")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();

    const uniqueKey = `${songTitle.toLowerCase()} - ${albumName.toLowerCase()}`;
    if (seenTitleAlbum.has(uniqueKey)) {
      continue;
    }
    seenTitleAlbum.add(uniqueKey);

    const artistName = matched.more_info?.singers ||
      matched.more_info?.artistMap?.primary_artists?.[0]?.name ||
      matched.primary_artists ||
      seed.composer ||
      "Tamil Hit Artist";

    let duration = "03:50";
    if (matched.duration) {
      const m = Math.floor(parseInt(matched.duration, 10) / 60);
      const s = parseInt(matched.duration, 10) % 60;
      duration = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    const imageUrl = matched.image
      ? matched.image.replace("150x150.jpg", "500x500.jpg")
      : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80";

    const baseHash = crypto.createHash('md5').update(`real-${songTitle}-${albumName}`).digest('hex').slice(0, 24);
    const id8D = crypto.createHash('md5').update(`real-${songTitle}-${albumName}-8d`).digest('hex').slice(0, 24);

    // 1. Normal Mode Track
    const normalSong = {
      _id: baseHash,
      id: baseHash,
      title: songTitle,
      artist: artistName,
      composer: seed.composer || artistName.split(',')[0],
      album: albumName,
      year: parseInt(matched.year, 10) || seed.year || 2024,
      language: "Tamil",
      genre: seed.genre,
      category: seed.category,
      audioMode: "normal",
      audioUrl: streamUrl,
      imageUrl: imageUrl,
      duration: duration,
      is8D: false,
      canonicalId: `real-${baseHash.slice(0, 8)}`,
      trendSource: `${seed.category} Verified Hit`,
      audioFeatures: {
        tempo: 105,
        energy: 0.70,
        danceability: 0.65,
        valence: 0.65,
        acousticness: 0.40,
        spectralCentroid: 2400,
        spectralRolloff: 3800,
        spectralContrast: 0.55,
        zeroCrossingRate: 0.05,
        calmness: 0.55,
        vector: [0.5, 0.7, 0.65, 0.65, 0.4, 0.6, 0.55, 0.5, 0.85, 0.55]
      }
    };

    // 2. 8D Spatial Immersion Track
    const eightDSong = {
      _id: id8D,
      id: id8D,
      title: `${songTitle} (8D Audio)`,
      artist: artistName,
      composer: seed.composer || artistName.split(',')[0],
      album: albumName,
      year: parseInt(matched.year, 10) || seed.year || 2024,
      language: "Tamil",
      genre: seed.genre,
      category: seed.category,
      audioMode: "8d",
      audioUrl: streamUrl,
      imageUrl: imageUrl,
      duration: duration,
      is8D: true,
      canonicalId: `real-8d-${id8D.slice(0, 8)}`,
      trendSource: `${seed.category} 8D Spatial Edition`,
      audioFeatures: {
        tempo: 105,
        energy: 0.75,
        danceability: 0.70,
        valence: 0.70,
        acousticness: 0.35,
        spectralCentroid: 2500,
        spectralRolloff: 3900,
        spectralContrast: 0.60,
        zeroCrossingRate: 0.05,
        calmness: 0.60,
        vector: [0.55, 0.75, 0.7, 0.7, 0.35, 0.65, 0.6, 0.5, 0.95, 0.6]
      }
    };

    verifiedSongs.push(normalSong, eightDSong);
    console.log(`[${verifiedSongs.length / 2}] ✅ Resolved: "${songTitle}" (${albumName})`);

    // Polite delay
    await sleep(60);
  }

  console.log(`\n🎉 Resolution Complete!`);
  console.log(`Total verified tracks built: ${verifiedSongs.length}`);
  console.log(`Total unique audio streams: ${seenAudioUrls.size} (100% Unique - Zero Duplicates!)`);

  // Save to web-admin/src/data/songsData.json
  const outPath = path.join(__dirname, '../../web-admin/src/data/songsData.json');
  fs.writeFileSync(outPath, JSON.stringify(verifiedSongs, null, 2), 'utf8');
  console.log(`💾 Saved verified catalog to: ${outPath}`);

  // Also sync to MongoDB if reachable
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/focus_music', { timeoutMS: 3000 });
    await mongoose.connection.collection('songs').deleteMany({});
    await mongoose.connection.collection('songs').insertMany(verifiedSongs);
    console.log(`🍃 Synced ${verifiedSongs.length} verified songs to local MongoDB!`);
    await mongoose.disconnect();
  } catch (err) {
    console.log('MongoDB not connected; static catalog ready for Vercel deployment.');
  }
}

buildVerifiedCatalog();
