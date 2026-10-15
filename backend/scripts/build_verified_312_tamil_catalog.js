const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

function cleanHtml(str) {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s*\([^)]*From[^)]*\)/gi, "")
    .trim();
}

function formatDuration(sec) {
  const s = parseInt(sec, 10);
  if (isNaN(s) || s <= 0) return "03:45";
  const m = Math.floor(s / 60);
  const remainingSec = s % 60;
  return `${m.toString().padStart(2, "0")}:${remainingSec.toString().padStart(2, "0")}`;
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

// 104 Curated trending Tamil queries
const CATALOG_SPECS = [
  // --- 1 to 40: LOVE & ROMANCE ---
  { canonicalId: "tamil-love-001", query: "Aasa Kooda Sai Abhyankkar", cleanTitle: "Aasa Kooda", genre: "Love", composer: "Sai Abhyankkar", trend: "Instagram Reel #1 Trending 2024" },
  { canonicalId: "tamil-love-002", query: "Katchi Sera Sai Abhyankkar", cleanTitle: "Katchi Sera", genre: "Love", composer: "Sai Abhyankkar", trend: "YouTube Global Charts 2024" },
  { canonicalId: "tamil-love-003", query: "Hey Minnale Amaran", cleanTitle: "Hey Minnale", genre: "Love", composer: "GV Prakash Kumar", trend: "Blockbuster Love Anthem 2024" },
  { canonicalId: "tamil-love-004", query: "Vennilavu Saaral Amaran", cleanTitle: "Vennilavu Saaral", genre: "Love", composer: "GV Prakash Kumar", trend: "Trending Romantic Melody 2024" },
  { canonicalId: "tamil-love-005", query: "Water Packet Raayan AR Rahman", cleanTitle: "Water Packet", genre: "Love", composer: "A. R. Rahman", trend: "Viral Love Melody 2024" },
  { canonicalId: "tamil-love-006", query: "Chuttamalle Devara Tamil Anirudh", cleanTitle: "Chuttamalle", genre: "Love", composer: "Anirudh Ravichander", trend: "Pan-India Sensation 2024" },
  { canonicalId: "tamil-love-007", query: "Spark GOAT Yuvan", cleanTitle: "Spark", genre: "Love", composer: "Yuvan Shankar Raja", trend: "GOAT Viral Love Duet 2024" },
  { canonicalId: "tamil-love-008", query: "Anbenum Leo Anirudh", cleanTitle: "Anbenum", genre: "Love", composer: "Anirudh Ravichander", trend: "Leo Heartfelt Melody 2023" },
  { canonicalId: "tamil-love-009", query: "Thaensudare Lover Sean Roldan", cleanTitle: "Thaensudare", genre: "Love", composer: "Sean Roldan", trend: "Reels Viral Love Ballad 2024" },
  { canonicalId: "tamil-love-010", query: "Usure Lover Sean Roldan", cleanTitle: "Usure", genre: "Love", composer: "Sean Roldan", trend: "Emotional Romantic Hit 2024" },
  { canonicalId: "tamil-love-011", query: "Velagaadha Lover Sean Roldan", cleanTitle: "Velagaadha", genre: "Love", composer: "Sean Roldan", trend: "Soulful Acoustic Love 2024" },
  { canonicalId: "tamil-love-012", query: "Megham Karukatha Thiruchitrambalam Anirudh", cleanTitle: "Megham Karukatha", genre: "Love", composer: "Anirudh Ravichander", trend: "National Award Winning Melody 2022" },
  { canonicalId: "tamil-love-013", query: "Nenjame Nenjame Maamannan AR Rahman", cleanTitle: "Nenjame Nenjame", genre: "Love", composer: "A. R. Rahman", trend: "AR Rahman Soulful Love Anthem" },
  { canonicalId: "tamil-love-014", query: "Jimmiki Ponnu Varisu", cleanTitle: "Jimmiki Ponnu", genre: "Love", composer: "Thaman S / Anirudh", trend: "Thalapathy Vijay Reel Craze" },
  { canonicalId: "tamil-love-015", query: "Ranjithame Varisu", cleanTitle: "Ranjithame", genre: "Love", composer: "Thaman S", trend: "500M+ Views Dance Romance" },
  { canonicalId: "tamil-love-016", query: "Mudhal Nee Mudivum Nee Sid Sriram", cleanTitle: "Mudhal Nee Mudivum Nee", genre: "Love", composer: "Darbuka Siva", trend: "Nostalgic Love Anthem" },
  { canonicalId: "tamil-love-017", query: "Kannaana Kanney Viswasam Imman", cleanTitle: "Kannaana Kanney", genre: "Love", composer: "D. Imman", trend: "National Award Hit Song" },
  { canonicalId: "tamil-love-018", query: "Marakkuma Nenjam VTK AR Rahman", cleanTitle: "Marakkuma Nenjam", genre: "Love", composer: "A. R. Rahman", trend: "Soulful Masterpiece 2022" },
  { canonicalId: "tamil-love-019", query: "Mallipoo VTK AR Rahman", cleanTitle: "Mallipoo", genre: "Love", composer: "A. R. Rahman", trend: "Global Tamil Dance Sensation" },
  { canonicalId: "tamil-love-020", query: "Kaathalae Kaathalae 96 Govind Vasantha", cleanTitle: "Kaathalae Kaathalae", genre: "Love", composer: "Govind Vasantha", trend: "Timeless Pure Romantic Melody" },
  { canonicalId: "tamil-love-021", query: "Life of Ram 96 Pradeep Kumar", cleanTitle: "Life of Ram", genre: "Love", composer: "Govind Vasantha", trend: "Peaceful Solitude Anthem" },
  { canonicalId: "tamil-love-022", query: "Enna Solla Thangamagan Anirudh", cleanTitle: "Enna Solla", genre: "Love", composer: "Anirudh Ravichander", trend: "All-Time Sweet Melody" },
  { canonicalId: "tamil-love-023", query: "Neeyum Naanum Naanum Rowdy Dhaan Anirudh", cleanTitle: "Neeyum Naanum", genre: "Love", composer: "Anirudh Ravichander", trend: "Acoustic Love Masterpiece" },
  { canonicalId: "tamil-love-024", query: "Thangamey Naanum Rowdy Dhaan Anirudh", cleanTitle: "Thangamey", genre: "Love", composer: "Anirudh Ravichander", trend: "Fun Romantic Classic" },
  { canonicalId: "tamil-love-025", query: "Sirikkadhey Remo Anirudh", cleanTitle: "Sirikkadhey", genre: "Love", composer: "Anirudh Ravichander", trend: "Catchy Love Pop" },
  { canonicalId: "tamil-love-026", query: "Senjitaley Remo Anirudh", cleanTitle: "Senjitaley", genre: "Love", composer: "Anirudh Ravichander", trend: "Feel-Good Love Vibe" },
  { canonicalId: "tamil-love-027", query: "Po Nee Po 3 Anirudh", cleanTitle: "Po Nee Po", genre: "Love", composer: "Anirudh Ravichander", trend: "Heartbreak & Emotional Classic" },
  { canonicalId: "tamil-love-028", query: "Idhazhin Oram 3 Anirudh", cleanTitle: "Idhazhin Oram", genre: "Love", composer: "Anirudh Ravichander", trend: "Sweet Piano Love Melody" },
  { canonicalId: "tamil-love-029", query: "Kanave Kanave David Anirudh", cleanTitle: "Kanave Kanave", genre: "Love", composer: "Anirudh Ravichander", trend: "Emotional Soulful Ballad" },
  { canonicalId: "tamil-love-030", query: "Bae Don Anirudh", cleanTitle: "Bae", genre: "Love", composer: "Anirudh Ravichander", trend: "Modern Romantic Reel Track" },
  { canonicalId: "tamil-love-031", query: "Private Party Don Anirudh", cleanTitle: "Private Party", genre: "Love", composer: "Anirudh Ravichander", trend: "Party Romance" },
  { canonicalId: "tamil-love-032", query: "Chellamma Doctor Anirudh", cleanTitle: "Chellamma", genre: "Love", composer: "Anirudh Ravichander", trend: "Viral Tik-Tok & Reel Anthem" },
  { canonicalId: "tamil-love-033", query: "So Baby Doctor Anirudh", cleanTitle: "So Baby", genre: "Love", composer: "Anirudh Ravichander", trend: "Western Classical Fusion Love" },
  { canonicalId: "tamil-love-034", query: "Kadhaippoma Oh My Kadavule Leon James", cleanTitle: "Kadhaippoma", genre: "Love", composer: "Leon James", trend: "Soul-stirring Sid Sriram Melody" },
  { canonicalId: "tamil-love-035", query: "Kaadhal En Kaviye Sid Sriram", cleanTitle: "Kaadhal En Kaviye", genre: "Love", composer: "Sid Sriram", trend: "Independent Romantic Hit" },
  { canonicalId: "tamil-love-036", query: "Maruvaarthai Enai Noki Paayum Thota", cleanTitle: "Maruvaarthai", genre: "Love", composer: "Darbuka Siva", trend: "Sid Sriram Legendary Love Track" },
  { canonicalId: "tamil-love-037", query: "Visiri Enai Noki Paayum Thota", cleanTitle: "Visiri", genre: "Love", composer: "Darbuka Siva", trend: "Breezy Romantic Melody" },
  { canonicalId: "tamil-love-038", query: "En Jeevan Theri GV Prakash", cleanTitle: "En Jeevan", genre: "Love", composer: "GV Prakash Kumar", trend: "Theri Emotional Melody" },
  { canonicalId: "tamil-love-039", query: "Thalli Pogathey AYM AR Rahman", cleanTitle: "Thalli Pogathey", genre: "Love", composer: "A. R. Rahman", trend: "Sid Sriram Breakthrough Anthem" },
  { canonicalId: "tamil-love-040", query: "Rasaali AYM AR Rahman", cleanTitle: "Rasaali", genre: "Love", composer: "A. R. Rahman", trend: "Classical Fusion Symphony" },

  // --- 41 to 80: SOULFUL MELODY & CHILL ---
  { canonicalId: "tamil-melody-041", query: "Onnoda Nadandhaa Viduthalai Ilaiyaraaja", cleanTitle: "Onnoda Nadandhaa", genre: "Melody", composer: "Ilaiyaraaja", trend: "Maestro Ilaiyaraaja Folk Romance" },
  { canonicalId: "tamil-melody-042", query: "Kaattumalli Viduthalai Ilaiyaraaja", cleanTitle: "Kaattumalli", genre: "Melody", composer: "Ilaiyaraaja", trend: "Ilaiyaraaja Magic 2023" },
  { canonicalId: "tamil-melody-043", query: "Nenjukkul Peidhidum Vaaranam Aayiram Harris", cleanTitle: "Nenjukkul Peidhidum", genre: "Melody", composer: "Harris Jayaraj", trend: "Guitar Melody Evergreen" },
  { canonicalId: "tamil-melody-044", query: "Mundhinam Paartheney Vaaranam Aayiram", cleanTitle: "Mundhinam Paartheney", genre: "Melody", composer: "Harris Jayaraj", trend: "Acoustic Melody Classic" },
  { canonicalId: "tamil-melody-045", query: "Adiye Bachelor Dhibu Ninan Thomas", cleanTitle: "Adiye", genre: "Melody", composer: "Dhibu Ninan Thomas", trend: "Kapil Kapilan Reel Viral" },
  { canonicalId: "tamil-melody-046", query: "En Rojaa Neeye Kushi Tamil", cleanTitle: "En Rojaa Neeye", genre: "Melody", composer: "Hesham Abdul Wahab", trend: "Hesham Abdul Wahab Melody 2023" },
  { canonicalId: "tamil-melody-047", query: "Aradhya Kushi Tamil Sid Sriram", cleanTitle: "Aradhya", genre: "Melody", composer: "Hesham Abdul Wahab", trend: "Sid Sriram & Chinmayi Duet" },
  { canonicalId: "tamil-melody-048", query: "Naan Pizhai Kaathuvaakula Rendu Kaadhal", cleanTitle: "Naan Pizhai", genre: "Melody", composer: "Anirudh Ravichander", trend: "Peaceful Meditative Love" },
  { canonicalId: "tamil-melody-049", query: "Two Two Two Kaathuvaakula Anirudh", cleanTitle: "Two Two Two", genre: "Melody", composer: "Anirudh Ravichander", trend: "Groovy Trio Melody" },
  { canonicalId: "tamil-melody-050", query: "Mayakkama Kalakkama Thiruchitrambalam", cleanTitle: "Mayakkama Kalakkama", genre: "Melody", composer: "Anirudh Ravichander", trend: "Soul Comforting Acoustic" },
  { canonicalId: "tamil-melody-051", query: "Bodhai Kaname Oh Manapenne Anirudh", cleanTitle: "Bodhai Kaname", genre: "Melody", composer: "Sachin-Jigar", trend: "Dreamy Pop Melody" },
  { canonicalId: "tamil-melody-052", query: "Ennodu Nee Irundhaal I AR Rahman", cleanTitle: "Ennodu Nee Irundhaal", genre: "Melody", composer: "A. R. Rahman", trend: "Grand Orchestral Romance" },
  { canonicalId: "tamil-melody-053", query: "Poo Pookum Oosai Minsara Kanavu AR Rahman", cleanTitle: "Poo Pookum Oosai", genre: "Melody", composer: "A. R. Rahman", trend: "Nature & Rain Masterpiece" },
  { canonicalId: "tamil-melody-054", query: "Vennilave Vennilave Minsara Kanavu", cleanTitle: "Vennilave Vennilave", genre: "Melody", composer: "A. R. Rahman", trend: "Hariharan Moonlit Melody" },
  { canonicalId: "tamil-melody-055", query: "Anbil Avan Vinnaithaandi Varuvaayaa", cleanTitle: "Anbil Avan", genre: "Melody", composer: "A. R. Rahman", trend: "Celebration of Love" },
  { canonicalId: "tamil-melody-056", query: "Hosanna Vinnaithaandi Varuvaayaa AR Rahman", cleanTitle: "Hosanna", genre: "Melody", composer: "A. R. Rahman", trend: "Youth Anthem of Love" },
  { canonicalId: "tamil-melody-057", query: "Omana Penne Vinnaithaandi Varuvaayaa", cleanTitle: "Omana Penne", genre: "Melody", composer: "A. R. Rahman", trend: "Malayalam-Tamil Fusion" },
  { canonicalId: "tamil-melody-058", query: "Aaruyire Guru AR Rahman", cleanTitle: "Aaruyire", genre: "Melody", composer: "A. R. Rahman", trend: "Deep Soulful Meditation" },
  { canonicalId: "tamil-melody-059", query: "Tere Bina Guru AR Rahman", cleanTitle: "Tere Bina", genre: "Melody", composer: "A. R. Rahman", trend: "Sufi Devotional Love" },
  { canonicalId: "tamil-melody-060", query: "Munbe Vaa Sillunu Oru Kaadhal AR Rahman", cleanTitle: "Munbe Vaa", genre: "Melody", composer: "A. R. Rahman", trend: "Shreya Ghoshal All-Time Hit" },
  { canonicalId: "tamil-melody-061", query: "New York Nagaram Sillunu Oru Kaadhal", cleanTitle: "New York Nagaram", genre: "Melody", composer: "A. R. Rahman", trend: "Introspective Rain Melody" },
  { canonicalId: "tamil-melody-062", query: "Mazhai Kuruvi Chekka Chivantha Vaanam", cleanTitle: "Mazhai Kuruvi", genre: "Melody", composer: "A. R. Rahman", trend: "Acoustic Birdsong Melody" },
  { canonicalId: "tamil-melody-063", query: "Bhoomi Bhoomi Chekka Chivantha Vaanam", cleanTitle: "Bhoomi Bhoomi", genre: "Melody", composer: "A. R. Rahman", trend: "Haunting Ambient Melody" },
  { canonicalId: "tamil-melody-064", query: "Chinanjiru Nilave Ponniyin Selvan 2", cleanTitle: "Chinanjiru Nilave", genre: "Melody", composer: "A. R. Rahman", trend: "Heart-wrenching Ballad 2023" },
  { canonicalId: "tamil-melody-065", query: "Aga Naga Ponniyin Selvan 2 AR Rahman", cleanTitle: "Aga Naga", genre: "Melody", composer: "A. R. Rahman", trend: "Kundavai-Vanthiyathevan Love Theme" },
  { canonicalId: "tamil-melody-066", query: "Alaikadal Ponniyin Selvan 1", cleanTitle: "Alaikadal", genre: "Melody", composer: "A. R. Rahman", trend: "Oceanic Acoustic Serenade" },
  { canonicalId: "tamil-melody-067", query: "Ponni Nadhi Ponniyin Selvan 1", cleanTitle: "Ponni Nadhi", genre: "Melody", composer: "A. R. Rahman", trend: "River Cauvery Majestic Song" },
  { canonicalId: "tamil-melody-068", query: "Veera Raja Veera Ponniyin Selvan 2", cleanTitle: "Veera Raja Veera", genre: "Melody", composer: "A. R. Rahman", trend: "Classical Heritage Duet" },
  { canonicalId: "tamil-melody-069", query: "En Kadhal Solla Paiyaa Yuvan", cleanTitle: "En Kadhal Solla", genre: "Melody", composer: "Yuvan Shankar Raja", trend: "U1 Evergreen Rain Melody" },
  { canonicalId: "tamil-melody-070", query: "Thuli Thuli Paiyaa Yuvan", cleanTitle: "Thuli Thuli", genre: "Melody", composer: "Yuvan Shankar Raja", trend: "Haricharan U1 Rain Hit" },
  { canonicalId: "tamil-melody-071", query: "Aadatha Aattamellam Pudhupettai Yuvan", cleanTitle: "Aadatha Aattamellam", genre: "Melody", composer: "Yuvan Shankar Raja", trend: "Philosophical Yuvan Gem" },
  { canonicalId: "tamil-melody-072", query: "Kan Pesum Varthaigal 7G Rainbow Colony", cleanTitle: "Kan Pesum Varthaigal", genre: "Melody", composer: "Yuvan Shankar Raja", trend: "Timeless 7G Melody" },
  { canonicalId: "tamil-melody-073", query: "Ayyayo Sethu Kaan Aduthathu Aadukalam", cleanTitle: "Ayyayo", genre: "Melody", composer: "GV Prakash Kumar", trend: "National Award Folk Romance" },
  { canonicalId: "tamil-melody-074", query: "Pirai Thedum Mayakkam Enna GV Prakash", cleanTitle: "Pirai Thedum", genre: "Melody", composer: "GV Prakash Kumar", trend: "Saindhavi Soulful Classic" },
  { canonicalId: "tamil-melody-075", query: "Otha Sollaala Aadukalam GV Prakash", cleanTitle: "Otha Sollaala", genre: "Melody", composer: "GV Prakash Kumar", trend: "Folk Melody Masterclass" },
  { canonicalId: "tamil-melody-076", query: "Kaadhal Sadugudu Alaipayuthey AR Rahman", cleanTitle: "Kaadhal Sadugudu", genre: "Melody", composer: "A. R. Rahman", trend: "Funky Soul Romance" },
  { canonicalId: "tamil-melody-077", query: "Pachai Nirame Alaipayuthey AR Rahman", cleanTitle: "Pachai Nirame", genre: "Melody", composer: "A. R. Rahman", trend: "Colors of Love Masterpiece" },
  { canonicalId: "tamil-melody-078", query: "Snehidhane Snehidhane Alaipayuthey", cleanTitle: "Snehidhane", genre: "Melody", composer: "A. R. Rahman", trend: "Sadhana Sargam Perfection" },
  { canonicalId: "tamil-melody-079", query: "Kandukondain Kandukondain AR Rahman", cleanTitle: "Kandukondain Kandukondain", genre: "Melody", composer: "A. R. Rahman", trend: "Carnatic Symphony" },
  { canonicalId: "tamil-melody-080", query: "Enna Sona Ok Jaanu Rahman", cleanTitle: "Enna Sona", genre: "Melody", composer: "A. R. Rahman", trend: "Soulful Acoustic" },

  // --- 81 to 104: VIBE & SOCIAL MEDIA TRENDS ---
  { canonicalId: "tamil-vibe-081", query: "Manasilaayo Vettaiyan Anirudh", cleanTitle: "Manasilaayo", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Global #1 Reels Trend 2024" },
  { canonicalId: "tamil-vibe-082", query: "Hunter Vantaar Vettaiyan Anirudh", cleanTitle: "Hunter Vantaar", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Thalaivar Mass BGM 2024" },
  { canonicalId: "tamil-vibe-083", query: "Fear Song Devara Anirudh", cleanTitle: "Fear Song", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Heavy Metal Mass Vibe 2024" },
  { canonicalId: "tamil-vibe-084", query: "Whistle Podu GOAT Thalapathy Vijay", cleanTitle: "Whistle Podu", genre: "Vibe", composer: "Yuvan Shankar Raja", trend: "Vijay Dance Fiesta 2024" },
  { canonicalId: "tamil-vibe-085", query: "Matta GOAT Yuvan", cleanTitle: "Matta", genre: "Vibe", composer: "Yuvan Shankar Raja", trend: "Party Viral Hit 2024" },
  { canonicalId: "tamil-vibe-086", query: "Naa Ready Leo Thalapathy Vijay", cleanTitle: "Naa Ready", genre: "Vibe", composer: "Anirudh Ravichander", trend: "1 Billion+ Viral Views 2023" },
  { canonicalId: "tamil-vibe-087", query: "Badass Leo Anirudh", cleanTitle: "Badass", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Leo Action Energy" },
  { canonicalId: "tamil-vibe-088", query: "Hukum Thalaivar Alappara Jailer", cleanTitle: "Hukum", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Thalaivar Megahit 2023" },
  { canonicalId: "tamil-vibe-089", query: "Kaavaalaa Jailer Anirudh", cleanTitle: "Kaavaalaa", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Global Viral Dance Challenge" },
  { canonicalId: "tamil-vibe-090", query: "Jujubee Jailer Anirudh", cleanTitle: "Jujubee", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Peppy Energy Beat" },
  { canonicalId: "tamil-vibe-091", query: "Vikram Title Track Anirudh", cleanTitle: "Vikram Title Track", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Electronic Bass Legend" },
  { canonicalId: "tamil-vibe-092", query: "Pathala Pathala Vikram Kamal Haasan", cleanTitle: "Pathala Pathala", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Kuthu Dance Craze" },
  { canonicalId: "tamil-vibe-093", query: "Porkanda Singam Vikram Anirudh", cleanTitle: "Porkanda Singam", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Intense Emotional Vibe" },
  { canonicalId: "tamil-vibe-094", query: "Master Coming Anirudh", cleanTitle: "Master Coming", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Gym & Workout #1 Beat" },
  { canonicalId: "tamil-vibe-095", query: "Vaathi Coming Master Anirudh", cleanTitle: "Vaathi Coming", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Global Celebrity Dance Hit" },
  { canonicalId: "tamil-vibe-096", query: "Vaathi Raid Master Anirudh Arivu", cleanTitle: "Vaathi Raid", genre: "Vibe", composer: "Anirudh Ravichander", trend: "High-octane Rap Vibe" },
  { canonicalId: "tamil-vibe-097", query: "Arabic Kuthu Beast Anirudh", cleanTitle: "Arabic Kuthu - Halamithi Habibo", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Global YouTube Record 2022" },
  { canonicalId: "tamil-vibe-098", query: "Jorthaale Asal Kolaar", cleanTitle: "Jorthaale", genre: "Vibe", composer: "OfRo / Asal Kolaar", trend: "Tamil Indie Hip-Hop Sensation" },
  { canonicalId: "tamil-vibe-099", query: "Vaadi Pulla Vaadi Meesaya Murukku", cleanTitle: "Vaadi Pulla Vaadi", genre: "Vibe", composer: "Hiphop Tamizha", trend: "Hiphop Tamizha Classic" },
  { canonicalId: "tamil-vibe-100", query: "Maattikittenae Meesaya Murukku", cleanTitle: "Maattikittenae", genre: "Vibe", composer: "Hiphop Tamizha", trend: "Viral College Vibe" },
  { canonicalId: "tamil-vibe-101", query: "Single Pasanga Natpe Thunai", cleanTitle: "Single Pasanga", genre: "Vibe", composer: "Hiphop Tamizha", trend: "Youth Bachelor Anthem" },
  { canonicalId: "tamil-vibe-102", query: "Dandanakka Romeo Juliet Imman", cleanTitle: "Dandanakka", genre: "Vibe", composer: "D. Imman", trend: "T. Rajendar Tribute Vibe" },
  { canonicalId: "tamil-vibe-103", query: "Raayan Rumble AR Rahman Arivu", cleanTitle: "Raayan Rumble", genre: "Vibe", composer: "A. R. Rahman", trend: "Dark Trap Mass Vibe 2024" },
  { canonicalId: "tamil-vibe-104", query: "Thaai Kelavi Thiruchitrambalam Anirudh", cleanTitle: "Thaai Kelavi", genre: "Vibe", composer: "Anirudh Ravichander", trend: "Festive Wedding Vibe" },
];

async function run() {
  console.log(`Starting discovery for ${CATALOG_SPECS.length} base songs...`);
  const resolved = [];
  const errors = [];

  for (let i = 0; i < CATALOG_SPECS.length; i++) {
    const spec = CATALOG_SPECS[i];
    const results = await searchSaavn(spec.query);
    let matched = null;

    if (results.length > 0) {
      // Find best match with encrypted_media_url
      matched = results.find(r => r.encrypted_media_url) || results[0];
    }

    if (!matched || !matched.encrypted_media_url) {
      // Try fallback search query with cleanTitle
      const altResults = await searchSaavn(spec.cleanTitle + " Tamil");
      matched = altResults.find(r => r.encrypted_media_url);
    }

    if (matched && matched.encrypted_media_url) {
      const streamUrl = decryptMediaUrl(matched.encrypted_media_url);
      const img = matched.image ? matched.image.replace("150x150", "500x500") : "";
      
      resolved.push({
        canonicalId: spec.canonicalId,
        cleanTitle: spec.cleanTitle || cleanHtml(matched.song),
        artist: cleanHtml(matched.primary_artists || matched.singers || spec.composer),
        composer: spec.composer,
        album: cleanHtml(matched.album || spec.cleanTitle),
        year: matched.year ? parseInt(matched.year, 10) : 2024,
        genre: spec.genre,
        category: spec.genre === "Love" ? "Tamil Love" : spec.genre === "Melody" ? "Tamil Melodies" : "Tamil Vibe",
        duration: formatDuration(matched.duration),
        audioUrl: streamUrl,
        imageUrl: img,
        trend: spec.trend,
      });
      console.log(`[${i + 1}/${CATALOG_SPECS.length}] Resolved: ${spec.cleanTitle} -> ${streamUrl ? "OK" : "NO STREAM"}`);
    } else {
      errors.push(spec);
      console.warn(`[${i + 1}/${CATALOG_SPECS.length}] Failed to resolve: ${spec.cleanTitle}`);
    }

    // Rate-limit friendly
    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\nResolved ${resolved.length} of ${CATALOG_SPECS.length}. Errors: ${errors.length}`);
  fs.writeFileSync(path.join(__dirname, "resolved_104_base.json"), JSON.stringify(resolved, null, 2));
}

run();
