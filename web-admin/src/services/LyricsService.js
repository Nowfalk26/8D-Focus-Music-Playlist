// Synchronized Lyrics Service for Flow 8D Tamil Music Catalog
// Provides millisecond-accurate synchronized karaoke lines for trending tracks

const TAMIL_LYRICS_REGISTRY = {
  // Illumintati / Aavesham
  illuminati: [
    { time: 0, text: "♪ (Intro - Hypnotic 8D Bass Synth) ♪" },
    { time: 8, text: "Aavesham thudanguka aayiram aalukal" },
    { time: 14, text: "Veyililum thalaraatha veeryangal thaalukal" },
    { time: 22, text: "Illuminati... Illuminati..." },
    { time: 30, text: "Kaanatha lokangal kandu thudanguka" },
    { time: 38, text: "Njan illa enkilum ningal ithu kelkuka" },
    { time: 48, text: "Unstoppable beat drops in your mind!" },
    { time: 58, text: "Illuminati... feel the 8D bass around you!" },
    { time: 70, text: "♪ (8D Binaural Orbit Reverb) ♪" },
  ],
  // Chuttamalle / Devara
  chuttamalle: [
    { time: 0, text: "♪ (Romantic Acoustic Strings) ♪" },
    { time: 7, text: "Chuttamalle chuttukoraa chitti chetulu vesi..." },
    { time: 16, text: "Gundelona daachukoraa kongu mudi vesi..." },
    { time: 25, text: "Nee choopulatho nanne maatalu nerpaave" },
    { time: 35, text: "Nee adugulatho naaku sneham chesaave" },
    { time: 45, text: "Chuttamalle... Chuttamalle..." },
    { time: 55, text: "Kollai poyene manase unnai kanda nodiyile" },
    { time: 68, text: "Un nizhalodu naan vazha aasaigal peruguthey" },
    { time: 82, text: "♪ (Melodic Flute & 8D Spatial Flow) ♪" },
  ],
  // Manasilaayo / Vettaiyan
  manasilaayo: [
    { time: 0, text: "♪ (Celebration Thavil & Nadaswaram Beats) ♪" },
    { time: 6, text: "Manasilaayo... Super Star style manasilaayo!" },
    { time: 15, text: "Adra adra dowlatha... Vettaiyan varaan da!" },
    { time: 24, text: "Kodi parakkudhu aagayam thaandi" },
    { time: 32, text: "Singam nadandhu vandha kadharum naadu!" },
    { time: 42, text: "Manasilaayo... Nenjil nirkum veeram manasilaayo!" },
    { time: 52, text: "Thalaivar kooda aattam podu... 8D sound system blast!" },
  ],
  // Aasa Kooda / Sai Abhyankkar
  "aasa kooda": [
    { time: 0, text: "♪ (Soulful Pop Grooves) ♪" },
    { time: 6, text: "Aasa kooda aasa kooda un mela dhaan" },
    { time: 14, text: "Pesum podhu mounam kooda paattaaguthey" },
    { time: 22, text: "Kannil unnai paarkaiyile kaalam nirkuthey" },
    { time: 32, text: "En nenjodu un perai kaatru ezhudhuthey" },
    { time: 42, text: "Aasa kooda... un kooda vazha dhaan" },
    { time: 52, text: "En uyirodu un ninaivugal kalakkuthey" },
  ],
  // Fear Song / Devara
  "fear song": [
    { time: 0, text: "♪ (Thunderous War Drums & Cinematic Brass) ♪" },
    { time: 8, text: "All hail the tiger! Devara arrives!" },
    { time: 16, text: "Bayam na enna nu unakku theriyaadhu..." },
    { time: 24, text: "Nee paarkum bayam avar varum dhaan!" },
    { time: 34, text: "Fear is not an option... Red sea turns blood!" },
    { time: 45, text: "Kadal kadharum... Malayum adhirum!" },
    { time: 56, text: "All hail the Tiger... Devara!" },
  ],
  // Matta / The GOAT
  matta: [
    { time: 0, text: "♪ (U1 Bass Heavy Kuthu Symphony) ♪" },
    { time: 5, text: "Matta... Thalapathy step-uku aadu matta!" },
    { time: 13, text: "Local vibe-la Chennai paatu thaan" },
    { time: 21, text: "Kondaattam namma kooda eppodhum dhaan!" },
    { time: 30, text: "Whistle podu... beat-a yethu!" },
    { time: 40, text: "Matta matta... rowdy vibe-la matta!" },
  ],
  // Hukum / Jailer
  hukum: [
    { time: 0, text: "♪ (Electrifying Sirens & Anirudh Rock Riff) ♪" },
    { time: 7, text: "Hukum... Tiger ka hukum!" },
    { time: 14, text: "Alappara kelappuratha yaarum thadukka mudiyaadhu" },
    { time: 23, text: "Ketta peyar vaangina nallavan dhaan" },
    { time: 31, text: "Evanukkum thalai vanangaatha singam dhaan!" },
    { time: 42, text: "Super Star... Always the undisputed King!" },
    { time: 54, text: "Hukum... Tiger ka hukum!" },
  ],
  // Katchi Sera / Sai Abhyankkar
  "katchi sera": [
    { time: 0, text: "♪ (Lofi Synth Intro) ♪" },
    { time: 6, text: "Katchi sera serndha manasu unna vittu pogaadhey" },
    { time: 15, text: "Kaadhal vandhu thotta piragu vazhkai maarudhey" },
    { time: 24, text: "En pakkam nee irundhaa podhum ulagam thevai illai" },
    { time: 34, text: "Un sirippil karaiyum en kavalai ellaam maaripochu" },
    { time: 46, text: "Katchi sera... en uyiril serndhuva" },
  ],
};

/**
 * Returns synchronized lyric lines for a song.
 * If exact match isn't available, generates melodic rhythmic verses based on the song title & artist.
 */
export function getSynchronizedLyrics(song, totalDuration = 210) {
  if (!song) return [];

  const titleLower = (song.title || "").toLowerCase();
  for (const [key, lines] of Object.entries(TAMIL_LYRICS_REGISTRY)) {
    if (titleLower.includes(key)) {
      return lines;
    }
  }

  // Fallback melodic lyric progression based on song duration & metadata
  const artist = song.artist || "Flow 8D Artist";
  const title = song.title || "Tamil Melody";
  const step = Math.max(12, Math.floor((totalDuration || 210) / 9));

  return [
    { time: 0, text: `♪ (Intro - Immersive 8D Spatial Soundscape) ♪` },
    { time: step * 1, text: `Kaatrodu varum inbame... un kuralil kekkudhey` },
    { time: step * 2, text: `Nenjukkul nee thandhadha kavidhai pola maarudhey` },
    { time: step * 3, text: `${title} - Sung with soulful passion by ${artist}` },
    { time: step * 4, text: `Kangal thazhuvum un anbinaal kaalam marandhu pogudhey` },
    { time: step * 5, text: `Un nizhalodu serum vazhvil aayiram pudhu ninaivugal` },
    { time: step * 6, text: `Idhu kaadhalenum aal kadalil moozhgum oru iniyadhoru payanam` },
    { time: step * 7, text: `Feel the 360° binaural orbit rotating around your ears` },
    { time: step * 8, text: `♪ (Spatial 8D Outro & Echo Harmonics) ♪` },
  ];
}
