const mongoose = require('mongoose');
const Song = require('../models/Song');
const fs = require('fs');

const path = require('path');

mongoose.connect('mongodb://127.0.0.1:27017/focus_music').then(async () => {
  const dataPath = path.join(__dirname, '../../web-admin/src/data/songsData.json');
  const songsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  for (const s of songsData) {
    await Song.updateOne({ _id: s._id }, { $set: { audioMode: s.audioMode, is8D: s.is8D } });
  }
  const counts = {
    normal: await Song.countDocuments({ audioMode: 'normal' }),
    '8d': await Song.countDocuments({ audioMode: '8d' }),
    '9d': await Song.countDocuments({ audioMode: '9d' }),
  };
  console.log('MongoDB updated counts:', counts);
  mongoose.disconnect();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
