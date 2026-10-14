const mongoose = require("mongoose");
const Song = require("../models/Song");

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/focus_music");
  const songs = await Song.find().select("title artist category audioMode");
  console.log("Total songs in DB:", songs.length);
  
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

  const generic = songs.filter(s => genericLabels.includes(s.artist));
  console.log("Generic placeholder songs count:", generic.length);
  generic.forEach(s => console.log(s._id, s.title, "---", s.artist, "---", s.audioMode));

  const modes = {};
  songs.forEach(s => {
    modes[s.audioMode] = (modes[s.audioMode] || 0) + 1;
  });
  console.log("Current modes breakdown:", modes);

  await mongoose.disconnect();
}

check().catch(console.error);
