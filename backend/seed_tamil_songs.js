require("dotenv").config();
const mongoose = require("mongoose");
const Song = require("./models/Song");
const Category = require("./models/Category");

// Helper to generate calibrated 10D vector
function computeVector(tempo, energy, danceability, valence, acousticness, centroid, contrast, calmness) {
  const norm_tempo = Math.min(1.0, Math.max(0.0, (tempo - 50.0) / 130.0));
  const norm_centroid = Math.min(1.0, Math.max(0.0, (centroid - 400.0) / 4000.0));
  return [
    Math.round(norm_tempo * 10000) / 10000,
    Math.round(energy * 10000) / 10000,
    Math.round(danceability * 10000) / 10000,
    Math.round(valence * 10000) / 10000,
    Math.round(acousticness * 10000) / 10000,
    Math.round(norm_centroid * 10000) / 10000,
    Math.round(contrast * 10000) / 10000,
    0.50, // Binaural frequency alignment
    0.85, // 8D spatial depth
    Math.round(calmness * 10000) / 10000,
  ];
}

const newCategories = [
  {
    name: "Tamil Movie Hits",
    description: "Blockbuster cinematic Tamil chartbusters revolving in true 8D spatial soundstage.",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Tamil Melodies 8D",
    description: "Soul-stirring romantic and heart-touching Tamil melodies with bilateral headphones pan.",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Tamil High Energy",
    description: "Electrifying fast-paced Kuthu beats, EDM drops, and adrenaline rush Tamil anthems.",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Tamil Ambient Relax",
    description: "Gentle acoustic guitar, flute, and midnight calm Tamil tracks for deep coding and reading.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Tamil Retro Classics",
    description: "Timeless golden melodies by Ilaiyaraaja, MSV, and early A.R. Rahman.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Tamil Indie & Pop",
    description: "Modern independent Tamil album sensations, indie wave, and contemporary viral hits.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
  },
];

// Audio URL rotation generator (using clean, publicly accessible audio streams)
const AUDIO_SOURCES = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
];

const COVERS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
];

// Raw curated metadata for 105+ authentic Tamil movie, album, and classic tracks
const TAMIL_TRACKS_CATALOG = [
  // --- ANIRUDH RAVICHANDER HITS ---
  { title: "Naa Ready (8D Spatial)", artist: "Anirudh Ravichander, Thalapathy Vijay", movie: "Leo", category: "Tamil High Energy", tempo: 130, energy: 0.94, danceability: 0.88, calmness: 0.15 },
  { title: "Badass (8D Blast)", artist: "Anirudh Ravichander", movie: "Leo", category: "Tamil High Energy", tempo: 134, energy: 0.96, danceability: 0.85, calmness: 0.12 },
  { title: "Hukum - Thalaivar Alappara (8D)", artist: "Anirudh Ravichander, Super Subu", movie: "Jailer", category: "Tamil High Energy", tempo: 126, energy: 0.92, danceability: 0.82, calmness: 0.18 },
  { title: "Kaavaalaa (8D Orbit)", artist: "Anirudh Ravichander, Shilpa Rao", movie: "Jailer", category: "Tamil High Energy", tempo: 120, energy: 0.85, danceability: 0.90, calmness: 0.25 },
  { title: "Jailer Theme (Alappara 8D)", artist: "Anirudh Ravichander", movie: "Jailer", category: "Tamil High Energy", tempo: 128, energy: 0.95, danceability: 0.78, calmness: 0.14 },
  { title: "Vaathi Coming (8D Kuthu)", artist: "Anirudh Ravichander, Gana Balachandar", movie: "Master", category: "Tamil High Energy", tempo: 132, energy: 0.95, danceability: 0.92, calmness: 0.10 },
  { title: "Master Coming Theme 8D", artist: "Anirudh Ravichander", movie: "Master", category: "Tamil High Energy", tempo: 128, energy: 0.90, danceability: 0.84, calmness: 0.20 },
  { title: "Quit Pannuda (8D Chill)", artist: "Anirudh Ravichander", movie: "Master", category: "Tamil Melodies 8D", tempo: 92, energy: 0.58, danceability: 0.65, calmness: 0.60 },
  { title: "Andha Kanna Paathaakaa (8D)", artist: "Anirudh Ravichander, Yuvan Shankar Raja", movie: "Master", category: "Tamil Melodies 8D", tempo: 88, energy: 0.52, danceability: 0.62, calmness: 0.68 },
  { title: "Vikram Title Track (8D Orbit)", artist: "Anirudh Ravichander", movie: "Vikram", category: "Tamil High Energy", tempo: 136, energy: 0.97, danceability: 0.86, calmness: 0.10 },
  { title: "Porkanda Singam (8D)", artist: "Anirudh Ravichander, Ravi G", movie: "Vikram", category: "Tamil Melodies 8D", tempo: 76, energy: 0.45, danceability: 0.40, calmness: 0.75 },
  { title: "Wasted (8D Frequency)", artist: "Anirudh Ravichander", movie: "Vikram", category: "Tamil High Energy", tempo: 122, energy: 0.86, danceability: 0.75, calmness: 0.28 },
  { title: "Arabic Kuthu - Halamithi Habibo (8D)", artist: "Anirudh Ravichander, Jonita Gandhi", movie: "Beast", category: "Tamil High Energy", tempo: 125, energy: 0.91, danceability: 0.89, calmness: 0.20 },
  { title: "Beast Mode (8D)", artist: "Anirudh Ravichander", movie: "Beast", category: "Tamil High Energy", tempo: 130, energy: 0.93, danceability: 0.80, calmness: 0.16 },
  { title: "Chellamma (8D Orbit)", artist: "Anirudh Ravichander, Jonita Gandhi", movie: "Doctor", category: "Tamil High Energy", tempo: 118, energy: 0.84, danceability: 0.86, calmness: 0.32 },
  { title: "So Baby (8D Melody)", artist: "Anirudh Ravichander, Ananthakrrishnan", movie: "Doctor", category: "Tamil Melodies 8D", tempo: 86, energy: 0.50, danceability: 0.60, calmness: 0.72 },
  { title: "Megham Karukatha (8D Soul)", artist: "Dhanush, Anirudh Ravichander", movie: "Thiruchitrambalam", category: "Tamil Melodies 8D", tempo: 84, energy: 0.48, danceability: 0.64, calmness: 0.78 },
  { title: "Thaai Kelavi (8D Folk)", artist: "Anirudh Ravichander, Dhanush", movie: "Thiruchitrambalam", category: "Tamil High Energy", tempo: 124, energy: 0.88, danceability: 0.85, calmness: 0.24 },
  { title: "Thenmozhi (8D Acoustic)", artist: "Santhosh Narayanan, Anirudh", movie: "Thiruchitrambalam", category: "Tamil Ambient Relax", tempo: 78, energy: 0.38, danceability: 0.48, calmness: 0.82 },
  { title: "Senjitaley (8D)", artist: "Anirudh Ravichander", movie: "Remo", category: "Tamil Melodies 8D", tempo: 102, energy: 0.72, danceability: 0.76, calmness: 0.45 },
  { title: "Sirikkadhey (8D Revolve)", artist: "Anirudh Ravichander, Arjun Kanungo", movie: "Remo", category: "Tamil Melodies 8D", tempo: 85, energy: 0.52, danceability: 0.58, calmness: 0.70 },
  { title: "Marana Mass (8D)", artist: "Anirudh Ravichander, S.P. Balasubrahmanyam", movie: "Petta", category: "Tamil High Energy", tempo: 134, energy: 0.95, danceability: 0.90, calmness: 0.10 },
  { title: "Petta Paraak (8D)", artist: "Anirudh Ravichander", movie: "Petta", category: "Tamil High Energy", tempo: 130, energy: 0.92, danceability: 0.82, calmness: 0.15 },
  { title: "Selfie Pulla (8D)", artist: "Thalapathy Vijay, Sunidhi Chauhan", movie: "Kaththi", category: "Tamil High Energy", tempo: 128, energy: 0.88, danceability: 0.86, calmness: 0.22 },
  { title: "Aathi Ena Nee (8D)", artist: "Vishal Dadlani, Anirudh", movie: "Kaththi", category: "Tamil Melodies 8D", tempo: 96, energy: 0.68, danceability: 0.65, calmness: 0.52 },
  { title: "Kathi Theme - The Sword of Destiny (8D)", artist: "Anirudh Ravichander", movie: "Kaththi", category: "Tamil High Energy", tempo: 120, energy: 0.86, danceability: 0.72, calmness: 0.30 },

  // --- A.R. RAHMAN TIMELESS MASTERPIECES ---
  { title: "Chinna Chinna Aasai (8D Spatial)", artist: "A.R. Rahman, Minmini", movie: "Roja", category: "Tamil Retro Classics", tempo: 82, energy: 0.40, danceability: 0.55, calmness: 0.82 },
  { title: "Pudhu Vellai Mazhai (8D Snow Rain)", artist: "A.R. Rahman, Unni Menon, Sujatha", movie: "Roja", category: "Tamil Ambient Relax", tempo: 74, energy: 0.32, danceability: 0.45, calmness: 0.88 },
  { title: "Kadhal Rojave (8D Orbit)", artist: "A.R. Rahman, S.P. Balasubrahmanyam", movie: "Roja", category: "Tamil Retro Classics", tempo: 70, energy: 0.35, danceability: 0.40, calmness: 0.85 },
  { title: "Kannalane Enadhu Kannai (8D)", artist: "A.R. Rahman, K.S. Chithra", movie: "Bombay", category: "Tamil Retro Classics", tempo: 80, energy: 0.42, danceability: 0.50, calmness: 0.80 },
  { title: "Uyire Uyire (8D Symphony)", artist: "A.R. Rahman, Hariharan, K.S. Chithra", movie: "Bombay", category: "Tamil Retro Classics", tempo: 72, energy: 0.38, danceability: 0.38, calmness: 0.84 },
  { title: "Bombay Theme (8D Spatial Strings)", artist: "A.R. Rahman", movie: "Bombay", category: "Tamil Ambient Relax", tempo: 65, energy: 0.26, danceability: 0.28, calmness: 0.94 },
  { title: "Anbendra Mazhaiyile (8D)", artist: "A.R. Rahman, Anuradha Sriram", movie: "Minsara Kanavu", category: "Tamil Retro Classics", tempo: 75, energy: 0.36, danceability: 0.42, calmness: 0.86 },
  { title: "Vennilave Vennilave (8D Cloud)", artist: "A.R. Rahman, Hariharan, Sadhana Sargam", movie: "Minsara Kanavu", category: "Tamil Ambient Relax", tempo: 76, energy: 0.34, danceability: 0.44, calmness: 0.87 },
  { title: "Enna Sona / Ennavale Adi Ennavale (8D)", artist: "A.R. Rahman, Unni Menon", movie: "Kadhalan", category: "Tamil Retro Classics", tempo: 78, energy: 0.38, danceability: 0.46, calmness: 0.83 },
  { title: "Urvashi Urvashi (8D Funk)", artist: "A.R. Rahman, Suresh Peters, Shahul Hameed", movie: "Kadhalan", category: "Tamil High Energy", tempo: 126, energy: 0.90, danceability: 0.88, calmness: 0.20 },
  { title: "Pachai Nirame (8D Colors)", artist: "A.R. Rahman, Hariharan, Clinton Cerejo", movie: "Alaipayuthey", category: "Tamil Melodies 8D", tempo: 84, energy: 0.46, danceability: 0.58, calmness: 0.78 },
  { title: "Snehidhane Snehidhane (8D Flute)", artist: "A.R. Rahman, Sadhana Sargam, Srinivas", movie: "Alaipayuthey", category: "Tamil Ambient Relax", tempo: 72, energy: 0.32, danceability: 0.42, calmness: 0.90 },
  { title: "Evano Oruvan (8D Rain String)", artist: "A.R. Rahman, Swarnalatha", movie: "Alaipayuthey", category: "Tamil Ambient Relax", tempo: 68, energy: 0.28, danceability: 0.32, calmness: 0.92 },
  { title: "Hosanna (8D Spatial Acoustic)", artist: "A.R. Rahman, Vijay Prakash, Suzanne D'Mello", movie: "Vinnaithaandi Varuvaayaa", category: "Tamil Melodies 8D", tempo: 94, energy: 0.62, danceability: 0.68, calmness: 0.65 },
  { title: "Aaruyire (8D Velvet Soul)", artist: "A.R. Rahman, Chinmayi, Murtuza Khan", movie: "Guru", category: "Tamil Ambient Relax", tempo: 70, energy: 0.30, danceability: 0.38, calmness: 0.91 },
  { title: "Tere Bina / Aaruyire Strings 8D", artist: "A.R. Rahman", movie: "Guru", category: "Tamil Ambient Relax", tempo: 66, energy: 0.25, danceability: 0.30, calmness: 0.95 },
  { title: "New York Nagaram (8D Midnight)", artist: "A.R. Rahman", movie: "Sillunu Oru Kaadhal", category: "Tamil Ambient Relax", tempo: 74, energy: 0.35, danceability: 0.45, calmness: 0.88 },
  { title: "Munbe Vaa En Anbe Vaa (8D)", artist: "A.R. Rahman, Shreya Ghoshal, Naresh Iyer", movie: "Sillunu Oru Kaadhal", category: "Tamil Melodies 8D", tempo: 86, energy: 0.52, danceability: 0.62, calmness: 0.72 },
  { title: "Ponni Nadhi (8D River Flow)", artist: "A.R. Rahman, AR Raihanah, Bamba Bakya", movie: "Ponniyin Selvan 1", category: "Tamil Movie Hits", tempo: 104, energy: 0.74, danceability: 0.72, calmness: 0.50 },
  { title: "Aga Naga (8D Royal Resonance)", artist: "A.R. Rahman, Shakthisree Gopalan", movie: "Ponniyin Selvan 2", category: "Tamil Melodies 8D", tempo: 78, energy: 0.38, danceability: 0.44, calmness: 0.85 },
  { title: "Chola Chola (8D War Drums)", artist: "A.R. Rahman, Sathya Prakash, VM Mahalingam", movie: "Ponniyin Selvan 1", category: "Tamil High Energy", tempo: 122, energy: 0.88, danceability: 0.75, calmness: 0.25 },
  { title: "Nenje Ezhu (8D Motivational)", artist: "A.R. Rahman", movie: "Maryan", category: "Tamil Movie Hits", tempo: 98, energy: 0.76, danceability: 0.64, calmness: 0.48 },
  { title: "Kadal Rasa Naan (8D Ocean)", artist: "A.R. Rahman, Yuvan Shankar Raja", movie: "Maryan", category: "Tamil Ambient Relax", tempo: 75, energy: 0.40, danceability: 0.46, calmness: 0.82 },
  { title: "Innum Konjam Neram (8D)", artist: "A.R. Rahman, Vijay Prakash, Shweta Mohan", movie: "Maryan", category: "Tamil Melodies 8D", tempo: 82, energy: 0.46, danceability: 0.56, calmness: 0.76 },
  { title: "Ennamo Yedho (8D Breeze)", artist: "A.R. Rahman, Srinivas, Sujatha", movie: "Rhythm", category: "Tamil Ambient Relax", tempo: 80, energy: 0.42, danceability: 0.50, calmness: 0.82 },
  { title: "Nadhiye Nadhiye (8D Water Panning)", artist: "A.R. Rahman, Unni Menon", movie: "Rhythm", category: "Tamil Ambient Relax", tempo: 72, energy: 0.36, danceability: 0.42, calmness: 0.88 },

  // --- YUVAN SHANKAR RAJA ADDICTIVE SOUNDSCAPES ---
  { title: "En Kadhal Solla (8D Travel Vibe)", artist: "Yuvan Shankar Raja, Tanvi Shah", movie: "Paiyaa", category: "Tamil Melodies 8D", tempo: 96, energy: 0.68, danceability: 0.74, calmness: 0.55 },
  { title: "Adada Mazhaida (8D Monsoon)", artist: "Yuvan Shankar Raja, Rahul Nambiar, Saindhavi", movie: "Paiyaa", category: "Tamil Movie Hits", tempo: 108, energy: 0.78, danceability: 0.76, calmness: 0.42 },
  { title: "Thuli Thuli Mazhaiyaai (8D)", artist: "Yuvan Shankar Raja, Haricharan, Tanvi Shah", movie: "Paiyaa", category: "Tamil Melodies 8D", tempo: 88, energy: 0.54, danceability: 0.65, calmness: 0.70 },
  { title: "Poongatre Poongatre (8D Night)", artist: "Yuvan Shankar Raja", movie: "Paiyaa", category: "Tamil Ambient Relax", tempo: 72, energy: 0.36, danceability: 0.45, calmness: 0.85 },
  { title: "Vilaiyaadu Mankatha (8D Casino Beat)", artist: "Yuvan Shankar Raja, Suchitra, Premgi", movie: "Mankatha", category: "Tamil High Energy", tempo: 130, energy: 0.94, danceability: 0.88, calmness: 0.14 },
  { title: "Machi Open The Bottle (8D)", artist: "Mano, Premgi Amaren, Tippu, Haricharan", movie: "Mankatha", category: "Tamil High Energy", tempo: 128, energy: 0.90, danceability: 0.86, calmness: 0.18 },
  { title: "Billa Theme (8D Don Bass)", artist: "Yuvan Shankar Raja", movie: "Billa", category: "Tamil High Energy", tempo: 122, energy: 0.92, danceability: 0.82, calmness: 0.16 },
  { title: "My Name is Billa (8D)", artist: "Yuvan Shankar Raja, Naveen", movie: "Billa", category: "Tamil High Energy", tempo: 124, energy: 0.88, danceability: 0.84, calmness: 0.22 },
  { title: "Ninaithu Ninaithu Paarthen (8D)", artist: "Yuvan Shankar Raja, Shreya Ghoshal", movie: "7G Rainbow Colony", category: "Tamil Ambient Relax", tempo: 68, energy: 0.32, danceability: 0.35, calmness: 0.90 },
  { title: "Kanaa Kaanum Kaalangal (8D School)", artist: "Yuvan Shankar Raja, Haricharan", movie: "7G Rainbow Colony", category: "Tamil Melodies 8D", tempo: 80, energy: 0.45, danceability: 0.50, calmness: 0.78 },
  { title: "Oru Naalil Vaazhkai (8D Soul Search)", artist: "Yuvan Shankar Raja", movie: "Pudhupettai", category: "Tamil Ambient Relax", tempo: 70, energy: 0.38, danceability: 0.38, calmness: 0.86 },
  { title: "Variya (8D Gangster Panning)", artist: "Yuvan Shankar Raja", movie: "Pudhupettai", category: "Tamil High Energy", tempo: 126, energy: 0.92, danceability: 0.78, calmness: 0.16 },
  { title: "Iragai Pole (8D Feather Cloud)", artist: "Yuvan Shankar Raja, Tanvi Shah", movie: "Naan Mahaan Alla", category: "Tamil Melodies 8D", tempo: 86, energy: 0.50, danceability: 0.60, calmness: 0.74 },
  { title: "Oru Maalai Neram (8D)", artist: "Yuvan Shankar Raja, Javed Ali", movie: "Naan Mahaan Alla", category: "Tamil Melodies 8D", tempo: 82, energy: 0.46, danceability: 0.52, calmness: 0.78 },
  { title: "Devathaiyai Kanden (8D)", artist: "Yuvan Shankar Raja, Harish Raghavendra", movie: "Kadhal Kondein", category: "Tamil Melodies 8D", tempo: 84, energy: 0.48, danceability: 0.54, calmness: 0.75 },
  { title: "Nenjodu Kalanthidu (8D)", artist: "Yuvan Shankar Raja, Unnikrishnan, Sujatha", movie: "Kaadhal Kondein", category: "Tamil Melodies 8D", tempo: 78, energy: 0.42, danceability: 0.48, calmness: 0.80 },
  { title: "Sola Vithu (8D Rowdy)", artist: "Yuvan Shankar Raja, Shankar Mahadevan", movie: "Dheena", category: "Tamil High Energy", tempo: 132, energy: 0.93, danceability: 0.85, calmness: 0.12 },
  { title: "Rowdy Baby (8D Dance Orbit)", artist: "Dhanush, Dhee, Yuvan Shankar Raja", movie: "Maari 2", category: "Tamil High Energy", tempo: 120, energy: 0.92, danceability: 0.94, calmness: 0.15 },

  // --- HARRIS JAYARAJ ACOUSTIC HARMONIES & GROOVES ---
  { title: "Nenjukkul Peidhidum (8D Acoustic Rain)", artist: "Harris Jayaraj, Hariharan, Devan Ekambaram", movie: "Vaaranam Aayiram", category: "Tamil Melodies 8D", tempo: 82, energy: 0.44, danceability: 0.56, calmness: 0.80 },
  { title: "Adiye Kolluthey (8D Guitar Strum)", artist: "Harris Jayaraj, Benny Dayal, Krish, Shruti Haasan", movie: "Vaaranam Aayiram", category: "Tamil Movie Hits", tempo: 106, energy: 0.76, danceability: 0.75, calmness: 0.48 },
  { title: "Annal Mele Panithuli (8D Dewdrop)", artist: "Harris Jayaraj, Sudha Raghunathan", movie: "Vaaranam Aayiram", category: "Tamil Ambient Relax", tempo: 70, energy: 0.32, danceability: 0.38, calmness: 0.92 },
  { title: "Mundhinam Paartheney (8D)", artist: "Harris Jayaraj, Naresh Iyer, Prashanthini", movie: "Vaaranam Aayiram", category: "Tamil Melodies 8D", tempo: 90, energy: 0.58, danceability: 0.65, calmness: 0.66 },
  { title: "Vaseegara (8D Breath Whisper)", artist: "Harris Jayaraj, Bombay Jayashri", movie: "Minnale", category: "Tamil Ambient Relax", tempo: 72, energy: 0.28, danceability: 0.36, calmness: 0.93 },
  { title: "Venmathi Venmathiye (8D Moon)", artist: "Harris Jayaraj, Tippu, Roop Kumar Rathod", movie: "Minnale", category: "Tamil Melodies 8D", tempo: 78, energy: 0.42, danceability: 0.48, calmness: 0.82 },
  { title: "Azhagiya Theeye (8D Flame)", artist: "Harris Jayaraj, Harish Raghavendra, Timmy", movie: "Minnale", category: "Tamil Movie Hits", tempo: 104, energy: 0.72, danceability: 0.74, calmness: 0.52 },
  { title: "Oru Maalai (8D Sunset Coffee)", artist: "Harris Jayaraj, Karthik", movie: "Ghajini", category: "Tamil Melodies 8D", tempo: 84, energy: 0.48, danceability: 0.58, calmness: 0.78 },
  { title: "Suttum Vizhi Chudar Thaaney (8D)", artist: "Harris Jayaraj, Sriram Parthasarathy, Bombay Jayashri", movie: "Ghajini", category: "Tamil Melodies 8D", tempo: 76, energy: 0.40, danceability: 0.44, calmness: 0.84 },
  { title: "X Machi (8D Electronic Funk)", artist: "Harris Jayaraj, Mathangi, Nakul", movie: "Ghajini", category: "Tamil High Energy", tempo: 124, energy: 0.88, danceability: 0.86, calmness: 0.22 },
  { title: "Uyirin Uyire (8D Shadow Panning)", artist: "Harris Jayaraj, KK, Suchitra", movie: "Kaakha Kaakha", category: "Tamil Movie Hits", tempo: 98, energy: 0.74, danceability: 0.68, calmness: 0.50 },
  { title: "Ennai Konjam Maatrum (8D)", artist: "Harris Jayaraj, Tippu, Timmy", movie: "Kaakha Kaakha", category: "Tamil Melodies 8D", tempo: 86, energy: 0.54, danceability: 0.62, calmness: 0.70 },
  { title: "Ondra Renda Aasaigal (8D)", artist: "Harris Jayaraj, Bombay Jayashri", movie: "Kaakha Kaakha", category: "Tamil Ambient Relax", tempo: 70, energy: 0.30, danceability: 0.38, calmness: 0.91 },
  { title: "Kannum Kannum Nokia (8D Cyber)", artist: "Harris Jayaraj, Andrea Jeremiah, Kunal Ganjawala", movie: "Anniyan", category: "Tamil High Energy", tempo: 126, energy: 0.90, danceability: 0.84, calmness: 0.18 },
  { title: "Kumari (8D Flute Echo)", artist: "Harris Jayaraj, Shankar Mahadevan, Harini", movie: "Anniyan", category: "Tamil Melodies 8D", tempo: 88, energy: 0.56, danceability: 0.64, calmness: 0.68 },
  { title: "Enamo Edho (8D Breeze)", artist: "Harris Jayaraj, Aalap Raju, Prashanthini", movie: "Ko", category: "Tamil Melodies 8D", tempo: 92, energy: 0.62, danceability: 0.70, calmness: 0.62 },
  { title: "Dhimu Dhimu (8D Heartbeat)", artist: "Harris Jayaraj, Karthik", movie: "Engeyum Kaadhal", category: "Tamil Melodies 8D", tempo: 82, energy: 0.48, danceability: 0.58, calmness: 0.78 },
  { title: "Nenjil Nenjil (8D Whisper)", artist: "Harris Jayaraj, Harish Raghavendra, Chinmayi", movie: "Engeyum Kaadhal", category: "Tamil Ambient Relax", tempo: 74, energy: 0.36, danceability: 0.42, calmness: 0.86 },

  // --- ILAIYARAAJA IMMORTAL CLASSICS ---
  { title: "Thenpandi Cheemayile (8D Soul)", artist: "Ilaiyaraaja, Kamal Haasan", movie: "Nayakan", category: "Tamil Retro Classics", tempo: 68, energy: 0.28, danceability: 0.32, calmness: 0.92 },
  { title: "Nee Oru Kaadhal Sangeetham (8D)", artist: "Ilaiyaraaja, Mano, K.S. Chithra", movie: "Nayakan", category: "Tamil Retro Classics", tempo: 78, energy: 0.38, danceability: 0.46, calmness: 0.82 },
  { title: "Rakkamma Kaiya Thattu (8D Festive)", artist: "Ilaiyaraaja, S.P. Balasubrahmanyam, Swarnalatha", movie: "Thalapathi", category: "Tamil Retro Classics", tempo: 122, energy: 0.88, danceability: 0.86, calmness: 0.22 },
  { title: "Sundari Kannal Oru Sethi (8D Symphony)", artist: "Ilaiyaraaja, S.P. Balasubrahmanyam, S. Janaki", movie: "Thalapathi", category: "Tamil Retro Classics", tempo: 74, energy: 0.36, danceability: 0.42, calmness: 0.86 },
  { title: "Mandram Vandha Kaattrukku (8D Wind)", artist: "Ilaiyaraaja, S.P. Balasubrahmanyam", movie: "Mouna Ragam", category: "Tamil Retro Classics", tempo: 72, energy: 0.32, danceability: 0.38, calmness: 0.89 },
  { title: "Chinna Chinna Vanna Kuyil (8D)", artist: "Ilaiyaraaja, S. Janaki", movie: "Mouna Ragam", category: "Tamil Retro Classics", tempo: 80, energy: 0.42, danceability: 0.50, calmness: 0.80 },
  { title: "Kaatril Enthan Geetham (8D Night Melody)", artist: "Ilaiyaraaja, S. Janaki", movie: "Johnny", category: "Tamil Retro Classics", tempo: 70, energy: 0.26, danceability: 0.32, calmness: 0.94 },
  { title: "Senorita I Love You (8D Disco)", artist: "Ilaiyaraaja, S.P. Balasubrahmanyam", movie: "Johnny", category: "Tamil Retro Classics", tempo: 116, energy: 0.78, danceability: 0.80, calmness: 0.40 },
  { title: "Raja Rajadhi Rajan (8D Royal)", artist: "Ilaiyaraaja, Mano", movie: "Agni Natchathiram", category: "Tamil Retro Classics", tempo: 124, energy: 0.86, danceability: 0.82, calmness: 0.24 },
  { title: "Ninnukori Varnam (8D Classical Fusion)", artist: "Ilaiyaraaja, K.S. Chithra", movie: "Agni Natchathiram", category: "Tamil Retro Classics", tempo: 86, energy: 0.52, danceability: 0.58, calmness: 0.72 },
  { title: "Kanne Kalaimane (8D Lullaby)", artist: "Ilaiyaraaja, K.J. Yesudas", movie: "Moondram Pirai", category: "Tamil Ambient Relax", tempo: 64, energy: 0.20, danceability: 0.25, calmness: 0.96 },

  // --- SANTHOSH NARAYANAN RAW FOLK & BASS ---
  { title: "Neruppu Da (8D Fire Walk)", artist: "Santhosh Narayanan, Arunraja Kamaraj", movie: "Kabali", category: "Tamil High Energy", tempo: 126, energy: 0.94, danceability: 0.80, calmness: 0.12 },
  { title: "Maya Nadhi (8D River Mist)", artist: "Santhosh Narayanan, Ananthu, Pradeep Kumar", movie: "Kabali", category: "Tamil Ambient Relax", tempo: 72, energy: 0.34, danceability: 0.40, calmness: 0.88 },
  { title: "Semma Weightu (8D Slum Beat)", artist: "Santhosh Narayanan, Harihara Sudhan", movie: "Kaala", category: "Tamil High Energy", tempo: 128, energy: 0.92, danceability: 0.85, calmness: 0.16 },
  { title: "Kannamma (8D Flute Soul)", artist: "Santhosh Narayanan, Pradeep Kumar, Dhee", movie: "Kaala", category: "Tamil Melodies 8D", tempo: 76, energy: 0.40, danceability: 0.46, calmness: 0.82 },
  { title: "Kandaa Vara Sollunga (8D Folk Cry)", artist: "Santhosh Narayanan, Kidakkuzhi Mariyammal", movie: "Karnan", category: "Tamil Movie Hits", tempo: 110, energy: 0.82, danceability: 0.72, calmness: 0.35 },
  { title: "Uttradheenga Yeppov (8D Drums)", artist: "Santhosh Narayanan, Dhee", movie: "Karnan", category: "Tamil High Energy", tempo: 120, energy: 0.88, danceability: 0.80, calmness: 0.22 },
  { title: "Vambula Thumbula (8D Boxing Punch)", artist: "Santhosh Narayanan, Gana Muthu", movie: "Sarpatta Parambarai", category: "Tamil High Energy", tempo: 130, energy: 0.95, danceability: 0.88, calmness: 0.12 },
  { title: "Neeye Oli (8D Champion Orbit)", artist: "Santhosh Narayanan, Shan Vincent de Paul, Navz-47", movie: "Sarpatta Parambarai", category: "Tamil High Energy", tempo: 125, energy: 0.91, danceability: 0.84, calmness: 0.20 },
  { title: "10000 Pax (8D Western Beat)", artist: "Santhosh Narayanan, OfRo", movie: "Jigarthanda DoubleX", category: "Tamil High Energy", tempo: 126, energy: 0.93, danceability: 0.82, calmness: 0.14 },

  // --- TAMIL INDIE & VIRAL ALBUM REVOLUTIONS ---
  { title: "Enjoy Enjaami (8D Earth Pulse)", artist: "Dhee, Arivu, Santhosh Narayanan", movie: "Maajja Single", category: "Tamil Indie & Pop", tempo: 112, energy: 0.85, danceability: 0.88, calmness: 0.35 },
  { title: "Katchi Sera (8D Viral Orbit)", artist: "Sai Abhyankkar", movie: "Think Music Single", category: "Tamil Indie & Pop", tempo: 118, energy: 0.82, danceability: 0.86, calmness: 0.38 },
  { title: "Aasa Kooda (8D Sweet Groove)", artist: "Sai Abhyankkar, Sai Smriti", movie: "Think Music Single", category: "Tamil Indie & Pop", tempo: 114, energy: 0.78, danceability: 0.84, calmness: 0.45 },
  { title: "Kutty Pattas (8D Celebration)", artist: "Santhosh Dhayanidhi, Rakshita Suresh", movie: "Sony Music Single", category: "Tamil Indie & Pop", tempo: 122, energy: 0.89, danceability: 0.90, calmness: 0.20 },
  { title: "Asku Maaro (8D Funky)", artist: "Dharan Kumar, K-Shiv", movie: "Sony Music Single", category: "Tamil Indie & Pop", tempo: 124, energy: 0.86, danceability: 0.85, calmness: 0.24 },
  { title: "Bodhai Kodhai (8D Intoxication)", artist: "Karthik, Santhosh Narayanan", movie: "Ondraga Originals", category: "Tamil Indie & Pop", tempo: 86, energy: 0.54, danceability: 0.60, calmness: 0.70 },
  { title: "Marappadhillai Nenje (8D Soul)", artist: "Leon James, Inno Genga", movie: "Sony Music Single", category: "Tamil Indie & Pop", tempo: 80, energy: 0.48, danceability: 0.55, calmness: 0.76 },
  { title: "Vaadi En Thangachila (8D)", artist: "Hip-hop Tamizha", movie: "Indie Pop", category: "Tamil High Energy", tempo: 126, energy: 0.91, danceability: 0.88, calmness: 0.18 },

  // --- SID SRIRAM MODERN CLASSICS ---
  { title: "Maruvaarthai Pesaadhey (8D Acoustic)", artist: "Sid Sriram, Darbuka Siva", movie: "Enai Noki Paayum Thota", category: "Tamil Melodies 8D", tempo: 80, energy: 0.46, danceability: 0.54, calmness: 0.80 },
  { title: "Visiri (8D Gentle Breeze)", artist: "Sid Sriram, Shashaa Tirupati, Darbuka Siva", movie: "Enai Noki Paayum Thota", category: "Tamil Melodies 8D", tempo: 84, energy: 0.50, danceability: 0.58, calmness: 0.76 },
  { title: "Kannana Kanne (8D Emotional Orbit)", artist: "Sid Sriram, D. Imman", movie: "Viswasam", category: "Tamil Melodies 8D", tempo: 76, energy: 0.44, danceability: 0.48, calmness: 0.82 },
  { title: "Kannaana Kanney (8D)", artist: "Anirudh Ravichander, Sean Roldan", movie: "Naanum Rowdy Dhaan", category: "Tamil Melodies 8D", tempo: 82, energy: 0.52, danceability: 0.60, calmness: 0.74 },
  { title: "Thangamey (8D Love)", artist: "Anirudh Ravichander", movie: "Naanum Rowdy Dhaan", category: "Tamil Movie Hits", tempo: 108, energy: 0.78, danceability: 0.80, calmness: 0.44 },
  { title: "Neeyum Naanum Anbe (8D)", artist: "Anirudh Ravichander, Raghu Dixit", movie: "Imaikkaa Nodigal", category: "Tamil Melodies 8D", tempo: 88, energy: 0.58, danceability: 0.66, calmness: 0.66 },
  { title: "Vilambara Idaiveli (8D)", artist: "Hiphop Tamizha, Christopher Stanley, Sudharshan", movie: "Imaikkaa Nodigal", category: "Tamil Movie Hits", tempo: 104, energy: 0.72, danceability: 0.76, calmness: 0.50 },
  { title: "Po Nee Po (8D Pain)", artist: "Anirudh Ravichander, Mohit Chauhan", movie: "3", category: "Tamil Ambient Relax", tempo: 72, energy: 0.38, danceability: 0.42, calmness: 0.86 },
  { title: "Idhazhin Oram (8D)", artist: "Anirudh Ravichander, Ajesh Ashok", movie: "3", category: "Tamil Melodies 8D", tempo: 78, energy: 0.44, danceability: 0.52, calmness: 0.80 },
  { title: "Why This Kolaveri Di (8D Global)", artist: "Anirudh Ravichander, Dhanush", movie: "3", category: "Tamil Movie Hits", tempo: 102, energy: 0.74, danceability: 0.82, calmness: 0.48 },

  // --- G.V. PRAKASH KUMAR ACOUSTIC & PASSION ---
  { title: "Otha Sollaala (8D Folk)", artist: "G.V. Prakash Kumar, Velmurugan", movie: "Aadukalam", category: "Tamil High Energy", tempo: 126, energy: 0.90, danceability: 0.86, calmness: 0.18 },
  { title: "Pirai Thedum (8D Rain Melody)", artist: "G.V. Prakash Kumar, Saindhavi", movie: "Mayakkam Enna", category: "Tamil Melodies 8D", tempo: 80, energy: 0.45, danceability: 0.50, calmness: 0.82 },
  { title: "Voda Voda (8D Pain Orbit)", artist: "Dhanush, G.V. Prakash Kumar", movie: "Mayakkam Enna", category: "Tamil Movie Hits", tempo: 110, energy: 0.80, danceability: 0.70, calmness: 0.38 },
  { title: "Pookal Pookum (8D Rose Bloom)", artist: "Roop Kumar Rathod, Harini, Andrea", movie: "Madrasapattinam", category: "Tamil Ambient Relax", tempo: 74, energy: 0.36, danceability: 0.42, calmness: 0.88 },
  { title: "Aariro (8D Father Lullaby)", artist: "Haricharan, G.V. Prakash Kumar", movie: "Deiva Thirumagal", category: "Tamil Ambient Relax", tempo: 66, energy: 0.24, danceability: 0.30, calmness: 0.94 },
  { title: "Kaattu Payale (8D Breeze)", artist: "Dhee, G.V. Prakash Kumar", movie: "Soorarai Pottru", category: "Tamil Melodies 8D", tempo: 92, energy: 0.64, danceability: 0.72, calmness: 0.62 },
  { title: "Veyyon Silli (8D Sunbeam)", artist: "Harish Sivaramakrishnan, G.V. Prakash", movie: "Soorarai Pottru", category: "Tamil Movie Hits", tempo: 106, energy: 0.78, danceability: 0.74, calmness: 0.45 },
  { title: "Hey Minnale (8D Sparkle)", artist: "Haricharan, Shweta Mohan, G.V. Prakash", movie: "Amaran", category: "Tamil Melodies 8D", tempo: 88, energy: 0.56, danceability: 0.64, calmness: 0.72 },

  // --- D. IMMAN VILLAGE RHYTHMS & STRINGS ---
  { title: "Kurumba (8D Father Orbit)", artist: "Sid Sriram, D. Imman", movie: "Tik Tik Tik", category: "Tamil Melodies 8D", tempo: 78, energy: 0.42, danceability: 0.48, calmness: 0.84 },
  { title: "Marudaani (8D Village Folk)", artist: "Nakash Aziz, Anthony Daasan", movie: "Namma Veettu Pillai", category: "Tamil High Energy", tempo: 122, energy: 0.88, danceability: 0.86, calmness: 0.22 },
  { title: "Gaanda Kannazhagi (8D)", artist: "Anirudh Ravichander, Neeti Mohan", movie: "Namma Veettu Pillai", category: "Tamil High Energy", tempo: 124, energy: 0.90, danceability: 0.88, calmness: 0.20 },
  { title: "Adchithooku (8D Pongal Kuthu)", artist: "D. Imman, Aditya Gadhavi", movie: "Viswasam", category: "Tamil High Energy", tempo: 132, energy: 0.95, danceability: 0.92, calmness: 0.10 },
  { title: "Soorakkathu (8D Whirlwind)", artist: "D. Imman", movie: "Marudhu", category: "Tamil High Energy", tempo: 128, energy: 0.91, danceability: 0.84, calmness: 0.18 },

  // --- HIPHOP TAMIZHA COLLEGE ANTHEMS ---
  { title: "Meesaya Murukku (8D Anthem)", artist: "Hiphop Tamizha, Kharesma Ravichandran", movie: "Meesaya Murukku", category: "Tamil High Energy", tempo: 126, energy: 0.92, danceability: 0.88, calmness: 0.16 },
  { title: "Vaadi Pulla Vaadi (8D Acoustic Rap)", artist: "Hiphop Tamizha", movie: "Meesaya Murukku", category: "Tamil Indie & Pop", tempo: 96, energy: 0.68, danceability: 0.76, calmness: 0.54 },
  { title: "Kerala Song (8D Celebration)", artist: "Hiphop Tamizha", movie: "Natpe Thunai", category: "Tamil High Energy", tempo: 124, energy: 0.89, danceability: 0.86, calmness: 0.22 },
  { title: "Aathichudi (8D Club Bass)", artist: "Hiphop Tamizha", movie: "TN 07 AL 4777", category: "Tamil High Energy", tempo: 130, energy: 0.94, danceability: 0.90, calmness: 0.12 },

  // --- VIDYASAGAR MELODIC & KUTHU MASTERPIECES ---
  { title: "Malare Mounama (8D Whispering Petal)", artist: "Vidyasagar, S.P. Balasubrahmanyam, S. Janaki", movie: "Karna", category: "Tamil Retro Classics", tempo: 74, energy: 0.35, danceability: 0.40, calmness: 0.88 },
  { title: "Appadi Podu (8D Legendary Kuthu)", artist: "KK, Anuradha Sriram, Vidyasagar", movie: "Ghilli", category: "Tamil High Energy", tempo: 136, energy: 0.98, danceability: 0.95, calmness: 0.08 },
  { title: "Arjunar Villu (8D Energy Chant)", artist: "Sukhwinder Singh, Manikka Vinayagam", movie: "Ghilli", category: "Tamil High Energy", tempo: 128, energy: 0.92, danceability: 0.84, calmness: 0.18 },
  { title: "Aal Thotta Boopathi (8D Disco)", artist: "Shankar Mahadevan, Anuradha Sriram", movie: "Youth", category: "Tamil High Energy", tempo: 130, energy: 0.94, danceability: 0.90, calmness: 0.12 },

  // --- SEAN ROLDAN & MODERN ROMANCE ---
  { title: "Naan Pizhai (8D Divine Love)", artist: "Ravi G, Shashaa Tirupati, Anirudh", movie: "Kaathuvaakula Rendu Kaadhal", category: "Tamil Melodies 8D", tempo: 82, energy: 0.46, danceability: 0.56, calmness: 0.80 },
  { title: "Dippam Dappam (8D Funky Groove)", artist: "Anthony Daasan, Anirudh Ravichander", movie: "Kaathuvaakula Rendu Kaadhal", category: "Tamil High Energy", tempo: 118, energy: 0.84, danceability: 0.88, calmness: 0.30 },
  { title: "Two Two Two (8D Celebration)", artist: "Anirudh Ravichander, Sunidhi Chauhan", movie: "Kaathuvaakula Rendu Kaadhal", category: "Tamil High Energy", tempo: 124, energy: 0.90, danceability: 0.88, calmness: 0.20 },
  { title: "Aagasatha (8D Mountain Breeze)", artist: "Kalyani Nair, Pradeep Kumar", movie: "Cuckoo", category: "Tamil Ambient Relax", tempo: 70, energy: 0.30, danceability: 0.38, calmness: 0.92 },
  { title: "Manasula Soora Kaathu (8D)", artist: "Sean Roldan, Divya Ramani", movie: "Cuckoo", category: "Tamil Melodies 8D", tempo: 76, energy: 0.38, danceability: 0.44, calmness: 0.86 },
];

async function seed100TamilSongs() {
  console.log("============================================================");
  console.log("🌱 Starting 100+ Tamil Songs Seeder with 10D ML Audio Features...");
  console.log("============================================================\n");

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focus_music");
    console.log("✓ Connected to MongoDB focus_music database.");

    // 1. Seed or update new Categories
    for (const cat of newCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`✓ Seeded Category: ${cat.name}`);
      }
    }

    // 2. Insert or update 105+ Tamil Songs
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < TAMIL_TRACKS_CATALOG.length; i++) {
      const track = TAMIL_TRACKS_CATALOG[i];
      const audioUrl = AUDIO_SOURCES[i % AUDIO_SOURCES.length];
      const imageUrl = COVERS[i % COVERS.length];

      // Derived acoustic metrics
      const tempo = track.tempo;
      const energy = track.energy;
      const danceability = track.danceability;
      const calmness = track.calmness;
      const valence = Math.round((energy * 0.5 + danceability * 0.4) * 100) / 100;
      const acousticness = Math.round((calmness * 0.8 + (1.0 - energy) * 0.2) * 100) / 100;
      const centroid = Math.round(1000 + energy * 2600);
      const contrast = Math.round((0.35 + energy * 0.4) * 100) / 100;

      const vector = computeVector(tempo, energy, danceability, valence, acousticness, centroid, contrast, calmness);

      const songData = {
        title: track.title,
        artist: `${track.artist} (${track.movie})`,
        category: track.category,
        audioUrl,
        imageUrl,
        duration: `0${Math.floor(3 + Math.random() * 3)}:${Math.floor(10 + Math.random() * 49)}`,
        is8D: true,
        audioFeatures: {
          tempo,
          energy,
          danceability,
          valence,
          acousticness,
          spectralCentroid: centroid,
          spectralRolloff: centroid * 1.6,
          spectralContrast: contrast,
          zeroCrossingRate: Math.round((0.03 + energy * 0.05) * 1000) / 1000,
          calmness,
          vector,
        },
      };

      const existing = await Song.findOne({ title: songData.title });
      if (!existing) {
        await Song.create(songData);
        inserted++;
      } else {
        existing.artist = songData.artist;
        existing.category = songData.category;
        existing.audioFeatures = songData.audioFeatures;
        await existing.save();
        updated++;
      }
    }

    const totalCount = await Song.countDocuments();

    console.log("\n============================================================");
    console.log(`🎉 Seeding Complete!`);
    console.log(`- New Tamil Songs Added: ${inserted}`);
    console.log(`- Updated Tracks: ${updated}`);
    console.log(`- Total Songs in Library: ${totalCount}`);
    console.log("============================================================");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed100TamilSongs();
