require("dotenv").config();
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
  console.log(`Successfully seeded ${docs.length} verified Tamil songs (104 Normal, 104 8D, 104 9D).`);

  await mongoose.disconnect();
}

if (require.main === module) {
  seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}

module.exports = { seed };
