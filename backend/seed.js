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
];

const sampleSongs = [
  {
    title: "Alpha State Orbit 8D",
    artist: "NeuroFocus Sound Lab",
    category: "Deep Focus",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60",
    duration: "06:12",
    is8D: true,
  },
  {
    title: "Theta Wave Synthesis",
    artist: "Binaural Mind Research",
    category: "Binaural Beats",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
    duration: "07:05",
    is8D: true,
  },
  {
    title: "Midnight Rain Panning 8D",
    artist: "Acoustic Biosphere",
    category: "Nature 8D",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60",
    duration: "05:43",
    is8D: true,
  },
  {
    title: "Serenade in Zen Orbit",
    artist: "Monk Harmonic Ensemble",
    category: "Meditation",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=500&auto=format&fit=crop&q=60",
    duration: "05:02",
    is8D: true,
  },
  {
    title: "Subtle Cosmos Brown Noise",
    artist: "Spatial Frequency Lab",
    category: "Ambient Noise",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
    duration: "04:36",
    is8D: true,
  },
  {
    title: "Velvet Horizon 8D",
    artist: "Deep Calm Collective",
    category: "Relaxation",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
    duration: "06:48",
    is8D: true,
  },
];

async function seedDatabase() {
  console.log("🌱 Starting 8D Focus Music Database Seeder...");

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
      console.log("✓ Admin user already exists: admin@focusmusic.com");
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
      console.log("✓ Demo user already exists: student@focusmusic.com");
    }

    // 3. Seed Categories
    for (const cat of sampleCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`✓ Category seeded: ${cat.name}`);
      }
    }

    // 4. Seed Songs
    for (const song of sampleSongs) {
      const exists = await Song.findOne({ title: song.title });
      if (!exists) {
        await Song.create(song);
        console.log(`✓ 8D Song seeded: ${song.title} (${song.category})`);
      }
    }

    console.log("\n🎉 Database Seed Completed Successfully!");
    console.log("==================================================");
    console.log("Admin Login Credentials:");
    console.log("Email:    admin@focusmusic.com");
    console.log("Password: admin123");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
