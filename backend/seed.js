require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Category = require("./models/Category");
const Song = require("./models/Song");

const sampleCategories = [
  {
    name: "Deep Focus",
    description: "Monotonic frequencies engineered for high-intensity coding and complex problem solving.",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Binaural Beats",
    description: "Dual frequency alpha (10Hz) and theta waves to synchronize cerebral hemispheres.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Relaxation",
    description: "Calming 8D panning soundscapes that decrease heart rate and reduce study fatigue.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Meditation",
    description: "Atmospheric resonant hums and harmonic singing bowls for mindfulness breaks.",
    imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Nature 8D",
    description: "Spatial rainfall, forest acoustic depth, and soothing ocean wave dynamics.",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Ambient Noise",
    description: "Gentle brown and pink noise blended with spatial acoustic pads.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Energetic Focus",
    description: "High-tempo driving rhythms and progressive pulse for crunch mode development.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
  },
];

const sampleSongs = [
  // --- ENERGETIC CLUSTER (High BPM, High Energy, High Danceability) ---
  {
    title: "Cyber Flow Overdrive 8D",
    artist: "SynthWave Pulse",
    category: "Energetic Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
    duration: "05:15",
    is8D: true,
    audioFeatures: {
      tempo: 132.0,
      energy: 0.90,
      danceability: 0.84,
      valence: 0.78,
      acousticness: 0.12,
      spectralCentroid: 3600.0,
      spectralRolloff: 5800.0,
      spectralContrast: 0.76,
      zeroCrossingRate: 0.082,
      calmness: 0.18,
      vector: [0.6308, 0.90, 0.84, 0.78, 0.12, 0.80, 0.76, 0.50, 0.95, 0.18],
    },
  },
  {
    title: "Quantum Sprint Velocity",
    artist: "Neon Circuitry",
    category: "Energetic Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
    duration: "06:02",
    is8D: true,
    audioFeatures: {
      tempo: 128.0,
      energy: 0.86,
      danceability: 0.80,
      valence: 0.72,
      acousticness: 0.16,
      spectralCentroid: 3300.0,
      spectralRolloff: 5400.0,
      spectralContrast: 0.72,
      zeroCrossingRate: 0.076,
      calmness: 0.22,
      vector: [0.60, 0.86, 0.80, 0.72, 0.16, 0.725, 0.72, 0.50, 0.90, 0.22],
    },
  },
  {
    title: "Hyperdrive Terminal 8D",
    artist: "Glitch Code Beats",
    category: "Energetic Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
    duration: "04:48",
    is8D: true,
    audioFeatures: {
      tempo: 124.0,
      energy: 0.82,
      danceability: 0.76,
      valence: 0.68,
      acousticness: 0.20,
      spectralCentroid: 3100.0,
      spectralRolloff: 5100.0,
      spectralContrast: 0.68,
      zeroCrossingRate: 0.071,
      calmness: 0.26,
      vector: [0.5692, 0.82, 0.76, 0.68, 0.20, 0.675, 0.68, 0.50, 0.88, 0.26],
    },
  },

  // --- STEADY DEEP FOCUS CLUSTER (Moderate BPM, Balanced Energy) ---
  {
    title: "Alpha State Orbit 8D",
    artist: "NeuroFocus Sound Lab",
    category: "Deep Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60",
    duration: "06:12",
    is8D: true,
    audioFeatures: {
      tempo: 110.0,
      energy: 0.58,
      danceability: 0.62,
      valence: 0.55,
      acousticness: 0.35,
      spectralCentroid: 2200.0,
      spectralRolloff: 3800.0,
      spectralContrast: 0.60,
      zeroCrossingRate: 0.052,
      calmness: 0.65,
      vector: [0.4615, 0.58, 0.62, 0.55, 0.35, 0.45, 0.60, 0.50, 0.85, 0.65],
    },
  },
  {
    title: "Cerebral Flow Cycle",
    artist: "Algorithm Acoustics",
    category: "Deep Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
    duration: "05:32",
    is8D: true,
    audioFeatures: {
      tempo: 105.0,
      energy: 0.52,
      danceability: 0.58,
      valence: 0.52,
      acousticness: 0.42,
      spectralCentroid: 2000.0,
      spectralRolloff: 3500.0,
      spectralContrast: 0.56,
      zeroCrossingRate: 0.048,
      calmness: 0.68,
      vector: [0.4231, 0.52, 0.58, 0.52, 0.42, 0.40, 0.56, 0.50, 0.85, 0.68],
    },
  },

  // --- BINAURAL & RELAXATION CLUSTER (Low-Mid BPM, Smooth Panning) ---
  {
    title: "Theta Wave Synthesis",
    artist: "Binaural Mind Research",
    category: "Binaural Beats",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
    duration: "07:05",
    is8D: true,
    audioFeatures: {
      tempo: 90.0,
      energy: 0.38,
      danceability: 0.40,
      valence: 0.45,
      acousticness: 0.70,
      spectralCentroid: 1400.0,
      spectralRolloff: 2500.0,
      spectralContrast: 0.45,
      zeroCrossingRate: 0.038,
      calmness: 0.82,
      vector: [0.3077, 0.38, 0.40, 0.45, 0.70, 0.25, 0.45, 0.75, 0.85, 0.82],
    },
  },
  {
    title: "Velvet Horizon 8D",
    artist: "Deep Calm Collective",
    category: "Relaxation",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
    duration: "06:48",
    is8D: true,
    audioFeatures: {
      tempo: 78.0,
      energy: 0.34,
      danceability: 0.45,
      valence: 0.55,
      acousticness: 0.65,
      spectralCentroid: 1600.0,
      spectralRolloff: 2800.0,
      spectralContrast: 0.48,
      zeroCrossingRate: 0.041,
      calmness: 0.80,
      vector: [0.2154, 0.34, 0.45, 0.55, 0.65, 0.30, 0.48, 0.50, 0.85, 0.80],
    },
  },

  // --- CALM MELODY & MEDITATION CLUSTER (Low BPM, High Acousticness, High Calmness) ---
  {
    title: "Midnight Rain Panning 8D",
    artist: "Acoustic Biosphere",
    category: "Nature 8D",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60",
    duration: "05:43",
    is8D: true,
    audioFeatures: {
      tempo: 65.0,
      energy: 0.28,
      danceability: 0.25,
      valence: 0.40,
      acousticness: 0.90,
      spectralCentroid: 950.0,
      spectralRolloff: 1520.0,
      spectralContrast: 0.35,
      zeroCrossingRate: 0.045,
      calmness: 0.92,
      vector: [0.1154, 0.28, 0.25, 0.40, 0.90, 0.1375, 0.35, 0.50, 0.85, 0.92],
    },
  },
  {
    title: "Serenade in Zen Orbit",
    artist: "Monk Harmonic Ensemble",
    category: "Meditation",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=500&auto=format&fit=crop&q=60",
    duration: "05:02",
    is8D: true,
    audioFeatures: {
      tempo: 72.0,
      energy: 0.24,
      danceability: 0.30,
      valence: 0.48,
      acousticness: 0.85,
      spectralCentroid: 1100.0,
      spectralRolloff: 1900.0,
      spectralContrast: 0.40,
      zeroCrossingRate: 0.035,
      calmness: 0.90,
      vector: [0.1692, 0.24, 0.30, 0.48, 0.85, 0.175, 0.40, 0.50, 0.85, 0.90],
    },
  },
  {
    title: "Subtle Cosmos Brown Noise",
    artist: "Spatial Frequency Lab",
    category: "Ambient Noise",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
    duration: "04:36",
    is8D: true,
    audioFeatures: {
      tempo: 60.0,
      energy: 0.32,
      danceability: 0.20,
      valence: 0.35,
      acousticness: 0.75,
      spectralCentroid: 1200.0,
      spectralRolloff: 2100.0,
      spectralContrast: 0.30,
      zeroCrossingRate: 0.040,
      calmness: 0.88,
      vector: [0.0769, 0.32, 0.20, 0.35, 0.75, 0.20, 0.30, 0.50, 0.85, 0.88],
    },
  },
  {
    title: "Ethereal Sanctuary Piano 8D",
    artist: "Solitude Chamber",
    category: "Relaxation",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    imageUrl: "https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=500&auto=format&fit=crop&q=60",
    duration: "05:18",
    is8D: true,
    audioFeatures: {
      tempo: 68.0,
      energy: 0.22,
      danceability: 0.28,
      valence: 0.50,
      acousticness: 0.92,
      spectralCentroid: 1050.0,
      spectralRolloff: 1750.0,
      spectralContrast: 0.38,
      zeroCrossingRate: 0.032,
      calmness: 0.94,
      vector: [0.1385, 0.22, 0.28, 0.50, 0.92, 0.1625, 0.38, 0.50, 0.85, 0.94],
    },
  },
];

async function seedDatabase() {
  console.log("🌱 Starting 8D Focus Music Database Seeder with Audio ML Features...");

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
    console.log("✓ Connected to MongoDB");

    // 1. Seed or update Admin User
    let admin = await User.findOne({ email: "admin@focusmusic.com" });
    if (!admin) {
      admin = await User.create({
        name: "Admin Master",
        email: "admin@focusmusic.com",
        password: "admin123",
        role: "admin",
      });
      console.log("✓ Admin user created: admin@focusmusic.com / admin123");
    } else {
      console.log("✓ Admin user verified: admin@focusmusic.com");
    }

    // 2. Seed or update Demo Student User
    let student = await User.findOne({ email: "student@focusmusic.com" });
    if (!student) {
      student = await User.create({
        name: "Demo Student",
        email: "student@focusmusic.com",
        password: "student123",
        role: "user",
      });
      console.log("✓ Demo user created: student@focusmusic.com / student123");
    } else {
      console.log("✓ Demo user verified: student@focusmusic.com");
    }

    // 3. Seed Categories
    for (const cat of sampleCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`✓ Category seeded: ${cat.name}`);
      }
    }

    // 4. Seed / Update Songs with calibrated audio features
    for (const song of sampleSongs) {
      const exists = await Song.findOne({ title: song.title });
      if (!exists) {
        await Song.create(song);
        console.log(`✓ Seeded song: ${song.title} [${song.category}] (${song.audioFeatures.tempo} BPM)`);
      } else {
        // Update audioFeatures if missing or outdated
        exists.audioFeatures = song.audioFeatures;
        await exists.save();
        console.log(`✓ Synchronized audio features: ${song.title} (${song.audioFeatures.tempo} BPM)`);
      }
    }

    console.log("\n🎉 Database Seed & Audio Feature Calibration Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
