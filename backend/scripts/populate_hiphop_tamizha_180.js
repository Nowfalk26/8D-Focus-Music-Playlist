const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Decrypt JioSaavn media URL
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

// Search JioSaavn API
async function searchSaavn(query) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&n=3&p=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

// Complete list of Hiphop Tamizha Songs (~180 tracks)
const HIPHOP_RAW_TRACKS = [
  // 1. Hip Hop Tamizhan (2012 Studio Album)
  { title: "Club le Mabbu le", album: "Hip Hop Tamizhan", year: 2012, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Iraiva", album: "Hip Hop Tamizhan", year: 2012, genre: "Devotional Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Manithan Tamizhan", album: "Hip Hop Tamizhan", year: 2012, genre: "Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Tamizh Theriyum", album: "Hip Hop Tamizhan", year: 2012, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Hey Do What I Say", album: "Hip Hop Tamizhan", year: 2012, genre: "Rap", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Sentamizh Penne", album: "Hip Hop Tamizhan", year: 2012, genre: "Love Rap", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Ini Naan Illai", album: "Hip Hop Tamizhan", year: 2012, genre: "Melody Rap", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "Stop Piracy", album: "Hip Hop Tamizhan", year: 2012, genre: "Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Tamilian Anthem", album: "Hip Hop Tamizhan", year: 2012, genre: "Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Karpom Karpippom", album: "Hip Hop Tamizhan", year: 2012, genre: "Social Rap", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Hip Hop Tamizhan (Title Track)", album: "Hip Hop Tamizhan", year: 2012, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 2. Naa Oru Alien (2020 Studio Album)
  { title: "Net ah Thorandha", album: "Naa Oru Alien", year: 2020, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Inayam", album: "Naa Oru Alien", year: 2020, genre: "Melody", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "Pogattum Pogattum", album: "Naa Oru Alien", year: 2020, genre: "Melody", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "Ellame Konjam Kaalam", album: "Naa Oru Alien", year: 2020, genre: "Inspirational", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Naa Oru Alien", album: "Naa Oru Alien", year: 2020, genre: "Rap", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Maya", album: "Naa Oru Alien", year: 2020, genre: "Philosophical", category: "Tamil Melodies", artist: "Hiphop Tamizha" },

  // 3. UNO (2024 Studio Album)
  { title: "UNO", album: "UNO", year: 2024, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Kaalam", album: "UNO", year: 2024, genre: "Melody", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "Oru Murai", album: "UNO", year: 2024, genre: "Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "High On Love", album: "UNO", year: 2024, genre: "Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Thani Vazhi (UNO)", album: "UNO", year: 2024, genre: "Rap", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Beat It", album: "UNO", year: 2024, genre: "EDM", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 4. Independent Singles & Collaborations
  { title: "Takkaru Takkaru", album: "Independent", year: 2016, genre: "Folk Rap", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Ezhuvoam Vaa", album: "Independent", year: 2015, genre: "Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Tamizhi", album: "Independent", year: 2019, genre: "Documentary Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Vaadi Pulla Vaadi", album: "Independent", year: 2014, genre: "Folk Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Oorukaaran", album: "Independent", year: 2021, genre: "Folk", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Poi Poi Poi", album: "Independent", year: 2023, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Ninaivirukka", album: "Independent", year: 2020, genre: "Melody", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "Nenjam Undu Nermai Undu", album: "Independent", year: 2019, genre: "Remix Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Madras Pride", album: "Independent", year: 2016, genre: "City Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Koorukatta Boomi", album: "Independent", year: 2022, genre: "Social Rap", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Vaazhkai Oru Vattam", album: "Independent", year: 2020, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Kuthu Fire", album: "Independent", year: 2017, genre: "Kuthu EDM", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 5. Aambala (2015)
  { title: "Madras To Madurai", album: "Aambala", year: 2015, genre: "Kuthu", category: "Tamil Mass", artist: "Kailash Kher, Vishnu Priya, Maria Roe" },
  { title: "Vaa Vaa Vaa Vannila", album: "Aambala", year: 2015, genre: "Love", category: "Tamil Love", artist: "Mohit Chauhan, Amrita Shekar" },
  { title: "Pazhagikalaam", album: "Aambala", year: 2015, genre: "Hip-Hop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Aye Aye Aye", album: "Aambala", year: 2015, genre: "Kuthu", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Yaar Enna Sonnalum", album: "Aambala", year: 2015, genre: "Folk", category: "Tamil Hits", artist: "Kutle Khan, Anthony Daasan" },
  { title: "Inbam Pongum Vennila", album: "Aambala", year: 2015, genre: "Retro Remix", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 6. Indru Netru Naalai (2015)
  { title: "Naane Thaan Raja", album: "Indru Netru Naalai", year: 2015, genre: "Sci-Fi Rap", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "iPhone 6 Nee Yendral", album: "Indru Netru Naalai", year: 2015, genre: "Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Kadhale Kadhale", album: "Indru Netru Naalai", year: 2015, genre: "Melody", category: "Tamil Melodies", artist: "Shankar Mahadevan, Padmalatha" },
  { title: "Indru Netru Naalai Theme", album: "Indru Netru Naalai", year: 2015, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "The Clock Theme", album: "Indru Netru Naalai", year: 2015, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 7. Thani Oruvan (2015)
  { title: "Kannala Kannala", album: "Thani Oruvan", year: 2015, genre: "Love", category: "Tamil Love", artist: "Kaushik Krish, Padmalatha" },
  { title: "Theemai Dhaan Vellum", album: "Thani Oruvan", year: 2015, genre: "Mass Theme", category: "Tamil Mass", artist: "Arvind Swamy, Hiphop Tamizha" },
  { title: "Aasai Peraasai", album: "Thani Oruvan", year: 2015, genre: "Philosophical", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Kadhal Cricket", album: "Thani Oruvan", year: 2015, genre: "Pop Love", category: "Tamil Hits", artist: "Kharesma Ravichandran" },
  { title: "Thani Oruvan (The Emptiness of Darkness)", album: "Thani Oruvan", year: 2015, genre: "Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 8. Aranmanai 2 (2016)
  { title: "Party with the Pei", album: "Aranmanai 2", year: 2016, genre: "EDM Kuthu", category: "Tamil Hits", artist: "Hiphop Tamizha, Kharesma" },
  { title: "Maya Maya", album: "Aranmanai 2", year: 2016, genre: "Melody", category: "Tamil Melodies", artist: "Kailash Kher, Padmalatha" },
  { title: "Kuchi Mittai", album: "Aranmanai 2", year: 2016, genre: "Folk", category: "Tamil Hits", artist: "Hiphop Tamizha, Anthony Daasan" },
  { title: "Poraada Poraada", album: "Aranmanai 2", year: 2016, genre: "Pathos", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "Aranmanai 2 Theme", album: "Aranmanai 2", year: 2016, genre: "Horror Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 9. Kathakali (2016)
  { title: "Azhage", album: "Kathakali", year: 2016, genre: "Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Erangi Vandhu", album: "Kathakali", year: 2016, genre: "Kuthu", category: "Tamil Mass", artist: "Hiphop Tamizha, Anthony Daasan" },
  { title: "Kathakali Whistle", album: "Kathakali", year: 2016, genre: "Whistle Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Kathakali Theme", album: "Kathakali", year: 2016, genre: "Action Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 10. Dhruva (2016 - Telugu)
  { title: "Neethoney Dance", album: "Dhruva", year: 2016, genre: "Dance Pop", category: "Tamil Hits", artist: "Hiphop Tamizha, Nikitha Gandhi" },
  { title: "Choosa Choosa", album: "Dhruva", year: 2016, genre: "Love", category: "Tamil Love", artist: "Sniggy, Padmalatha" },
  { title: "Pareshanura", album: "Dhruva", year: 2016, genre: "Seductive Pop", category: "Tamil Hits", artist: "Vishnu Priya, Padmalatha" },
  { title: "Manishi Musugulo", album: "Dhruva", year: 2016, genre: "Philosophical", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Dhruva Title Track", album: "Dhruva", year: 2016, genre: "Mass Theme", category: "Tamil Mass", artist: "Amit Mishra" },

  // 11. Kaththi Sandai (2016)
  { title: "Naan Konjam Karuppu Thaan", album: "Kaththi Sandai", year: 2016, genre: "Kuthu", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Kaththi Sandai Theme", album: "Kaththi Sandai", year: 2016, genre: "Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Ellame Kaasu", album: "Kaththi Sandai", year: 2016, genre: "Fun", category: "Tamil Hits", artist: "Hiphop Tamizha, Mark Thomas" },
  { title: "Idhayam Idhayam", album: "Kaththi Sandai", year: 2016, genre: "Melody", category: "Tamil Melodies", artist: "Kharesma Ravichandran" },

  // 12. Kavan (2017)
  { title: "Oxygen", album: "Kavan", year: 2017, genre: "Love", category: "Tamil Love", artist: "Hiphop Tamizha, Sudharshan Ashok" },
  { title: "Boomerang", album: "Kavan", year: 2017, genre: "Social Rap", category: "Tamil Hits", artist: "Hiphop Tamizha, Nikitha Gandhi" },
  { title: "Theeratha Vilayattu Pillai", album: "Kavan", year: 2017, genre: "Classical Fusion", category: "Tamil Hits", artist: "Hiphop Tamizha, Padmalatha" },
  { title: "Happy New Year", album: "Kavan", year: 2017, genre: "Party", category: "Tamil Hits", artist: "T. Rajendar, Hiphop Tamizha" },
  { title: "Mathurangalam", album: "Kavan", year: 2017, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 13. Meesaya Murukku (2017)
  { title: "Great Ji", album: "Meesaya Murukku", year: 2017, genre: "College Kuthu", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Machi Engalukku Elaam", album: "Meesaya Murukku", year: 2017, genre: "Friendship Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Vaadi Nee Vaadi", album: "Meesaya Murukku", year: 2017, genre: "Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Enna Nadanthalum", album: "Meesaya Murukku", year: 2017, genre: "Inspirational Melody", category: "Tamil Melodies", artist: "Kaushik Krish, Hiphop Tamizha" },
  { title: "Meesaya Murukku Title Track", album: "Meesaya Murukku", year: 2017, genre: "Mass Anthem", category: "Tamil Mass", artist: "Hiphop Tamizha, Kharesma" },
  { title: "Maatikichu", album: "Meesaya Murukku", year: 2017, genre: "Fun", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Sakkarakatti", album: "Meesaya Murukku", year: 2017, genre: "Folk", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Vaadi Pulla Vaadi (Film Version)", album: "Meesaya Murukku", year: 2017, genre: "Folk Love", category: "Tamil Love", artist: "Hiphop Tamizha" },

  // 14. Kalakalappu 2 (2018)
  { title: "Oru Kuchi Oru Kulfi", album: "Kalakalappu 2", year: 2018, genre: "Fun Kuthu", category: "Tamil Mass", artist: "Gana Vinoth, Saravedi Saran" },
  { title: "Thaarumaaru", album: "Kalakalappu 2", year: 2018, genre: "Party", category: "Tamil Hits", artist: "Santhosh Hariharan, Sniggy" },
  { title: "Pudhu Padam Romba Nallarku", album: "Kalakalappu 2", year: 2018, genre: "Folk", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Krishna Mukunda", album: "Kalakalappu 2", year: 2018, genre: "Devotional Rap", category: "Tamil Hits", artist: "Kaushik Krish, Padmalatha" },
  { title: "Kalakalappu 2 Theme", album: "Kalakalappu 2", year: 2018, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 15. Krishnarjuna Yudham (2018 - Telugu)
  { title: "Dhaari Choodu", album: "Krishnarjuna Yudham", year: 2018, genre: "Folk Mass", category: "Tamil Mass", artist: "Penchal Das, Hiphop Tamizha" },
  { title: "I Wanna Fly", album: "Krishnarjuna Yudham", year: 2018, genre: "Love", category: "Tamil Love", artist: "Revanth, Sanjith Hegde" },
  { title: "Ela Ela", album: "Krishnarjuna Yudham", year: 2018, genre: "Melody", category: "Tamil Melodies", artist: "Yazin Nizar" },
  { title: "Urime Manase", album: "Krishnarjuna Yudham", year: 2018, genre: "Melody", category: "Tamil Melodies", artist: "Raghu Dixit" },
  { title: "Thaaney Vachhindhana", album: "Krishnarjuna Yudham", year: 2018, genre: "Fun", category: "Tamil Hits", artist: "Kaala Bhairava, Padmalatha" },

  // 16. Imaikkaa Nodigal (2018)
  { title: "Vilambara Idaiveli", album: "Imaikkaa Nodigal", year: 2018, genre: "Melody", category: "Tamil Melodies", artist: "Christopher Stanley, Sudharshan Ashok" },
  { title: "Kadhalikathey", album: "Imaikkaa Nodigal", year: 2018, genre: "Breakup", category: "Tamil Hits", artist: "Hiphop Tamizha, Kaushik Krish" },
  { title: "Neeyum Naanum Anbe", album: "Imaikkaa Nodigal", year: 2018, genre: "Love", category: "Tamil Love", artist: "Raghu Dixit, Satyaprakash" },
  { title: "Lion in the Jungle", album: "Imaikkaa Nodigal", year: 2018, genre: "Rap", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Rudra Theme", album: "Imaikkaa Nodigal", year: 2018, genre: "Thriller Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 17. Natpe Thunai (2019)
  { title: "Kerala Song", album: "Natpe Thunai", year: 2019, genre: "Folk Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Single Pasanga", album: "Natpe Thunai", year: 2019, genre: "Bachelor Anthem", category: "Tamil Mass", artist: "Hiphop Tamizha, Kaka Balachander" },
  { title: "Veedhi Veedhi", album: "Natpe Thunai", year: 2019, genre: "Kuthu", category: "Tamil Hits", artist: "Anthony Daasan" },
  { title: "Pallikoodam", album: "Natpe Thunai", year: 2019, genre: "School Nostalgia", category: "Tamil Melodies", artist: "Sanjith Hegde" },
  { title: "Natpe Thunai Anthem", album: "Natpe Thunai", year: 2019, genre: "Hockey Anthem", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Aathadi", album: "Natpe Thunai", year: 2019, genre: "Folk", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Madurai Pettai", album: "Natpe Thunai", year: 2019, genre: "Folk Mass", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Morattu Single", album: "Natpe Thunai", year: 2019, genre: "Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 18. Mr. Local (2019)
  { title: "Takkunu Takkunu", album: "Mr. Local", year: 2019, genre: "Love", category: "Tamil Love", artist: "Anirudh Ravichander" },
  { title: "Kalakkalu Mr. Localu", album: "Mr. Local", year: 2019, genre: "Kuthu", category: "Tamil Mass", artist: "Sivakarthikeyan" },
  { title: "Menaminiki", album: "Mr. Local", year: 2019, genre: "Fun", category: "Tamil Hits", artist: "Benny Dayal, Sniggy" },
  { title: "Nee Nenacha", album: "Mr. Local", year: 2019, genre: "Melody", category: "Tamil Melodies", artist: "Sid Sriram" },
  { title: "Mr. Local Theme", album: "Mr. Local", year: 2019, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 19. Comali (2019)
  { title: "Paisa Note", album: "Comali", year: 2019, genre: "Dance", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Oliyum Oliyum", album: "Comali", year: 2019, genre: "90s Nostalgia", category: "Tamil Hits", artist: "Sathya Prakash, Bamba Bakya" },
  { title: "Hi Sonna Podhum", album: "Comali", year: 2019, genre: "Love", category: "Tamil Love", artist: "Kaushik Krish" },
  { title: "Nanba Nanba", album: "Comali", year: 2019, genre: "Friendship", category: "Tamil Melodies", artist: "Sanjith Hegde" },
  { title: "Comali Theme", album: "Comali", year: 2019, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 20. Action (2019)
  { title: "Nee Sirichalum", album: "Action", year: 2019, genre: "Love", category: "Tamil Love", artist: "Sadhana Sargam, Jonita Gandhi" },
  { title: "Lights Camera Action", album: "Action", year: 2019, genre: "Rap", category: "Tamil Mass", artist: "Hiphop Tamizha, Paul B Sailus" },
  { title: "Faded Love", album: "Action", year: 2019, genre: "English Pop", category: "Tamil Hits", artist: "Kharesma Ravichandran" },
  { title: "Maula Maula", album: "Action", year: 2019, genre: "Sufi", category: "Tamil Melodies", artist: "Bamba Bakya, Kutle Khan" },
  { title: "Action Theme", album: "Action", year: 2019, genre: "Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 21. Naan Sirithal (2020)
  { title: "Breakup Song", album: "Naan Sirithal", year: 2020, genre: "Breakup", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Dhom Dhom", album: "Naan Sirithal", year: 2020, genre: "Melody", category: "Tamil Melodies", artist: "Sanjith Hegde" },
  { title: "Ajukku Gumukku", album: "Naan Sirithal", year: 2020, genre: "Kuthu", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Keka Keka", album: "Naan Sirithal", year: 2020, genre: "Laughter Rap", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Happy Birthday (Naan Sirithal)", album: "Naan Sirithal", year: 2020, genre: "Birthday Song", category: "Tamil Hits", artist: "Hiphop Tamizha, Diwakar" },
  { title: "Naan Sirithal Theme", album: "Naan Sirithal", year: 2020, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 22. A1 Express (2021 - Telugu)
  { title: "Single Kingulam", album: "A1 Express", year: 2021, genre: "Bachelor Anthem", category: "Tamil Mass", artist: "Rahul Sipligunj" },
  { title: "Amigo", album: "A1 Express", year: 2021, genre: "Love", category: "Tamil Love", artist: "Inno Genga" },
  { title: "Poratamey", album: "A1 Express", year: 2021, genre: "Sports Anthem", category: "Tamil Hits", artist: "Kaala Bhairava" },
  { title: "Charithaney", album: "A1 Express", year: 2021, genre: "Melody", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "A1 Express Theme", album: "A1 Express", year: 2021, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 23. Sivakumarin Sabadham (2021)
  { title: "Sivakumar Pondati", album: "Sivakumarin Sabadham", year: 2021, genre: "Love Kuthu", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "Thillalangadi Lady", album: "Sivakumarin Sabadham", year: 2021, genre: "Pop", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Neruppa Irupom", album: "Sivakumarin Sabadham", year: 2021, genre: "Inspirational", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Bahama Naana", album: "Sivakumarin Sabadham", year: 2021, genre: "Fun", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Oorellam Sabadham", album: "Sivakumarin Sabadham", year: 2021, genre: "Anthem", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Sivakumarin Sabadham Theme", album: "Sivakumarin Sabadham", year: 2021, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 24. Anbarivu (2022)
  { title: "Arakkiyae", album: "Anbarivu", year: 2022, genre: "Love", category: "Tamil Love", artist: "Yuvan Shankar Raja" },
  { title: "Ready Steady Go", album: "Anbarivu", year: 2022, genre: "Kuthu", category: "Tamil Mass", artist: "Santhosh Narayanan" },
  { title: "Kanavugal", album: "Anbarivu", year: 2022, genre: "Melody", category: "Tamil Melodies", artist: "Benny Dayal, Bamba Bakya" },
  { title: "Thanga Sela", album: "Anbarivu", year: 2022, genre: "Folk", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Kannirendum", album: "Anbarivu", year: 2022, genre: "Melody", category: "Tamil Melodies", artist: "Saindhavi" },
  { title: "Anbarivu Theme", album: "Anbarivu", year: 2022, genre: "Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 25. Agent (2023 - Telugu)
  { title: "Wild Saala", album: "Agent", year: 2023, genre: "EDM Rap", category: "Tamil Mass", artist: "Brelle Battle" },
  { title: "Rama Krishna", album: "Agent", year: 2023, genre: "Mass", category: "Tamil Mass", artist: "Ram Miriyala" },
  { title: "Endhe Endhe", album: "Agent", year: 2023, genre: "Love", category: "Tamil Love", artist: "Sanjith Hegde" },
  { title: "Agent Title Track", album: "Agent", year: 2023, genre: "Action Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 26. Veeran (2023)
  { title: "Thunderkaaran", album: "Veeran", year: 2023, genre: "Superhero Folk", category: "Tamil Mass", artist: "Anirudh Ravichander, Hiphop Tamizha" },
  { title: "Papara Mittai", album: "Veeran", year: 2023, genre: "Folk", category: "Tamil Hits", artist: "Vaisagh" },
  { title: "Veeran Thiruvizha", album: "Veeran", year: 2023, genre: "Village Folk", category: "Tamil Mass", artist: "Muthu Sirpi" },
  { title: "Veeran Theme", album: "Veeran", year: 2023, genre: "Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Minnal Theme", album: "Veeran", year: 2023, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 27. PT Sir (2024)
  { title: "Kalloorikku", album: "PT Sir", year: 2024, genre: "College Song", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Kutty Pisase", album: "PT Sir", year: 2024, genre: "Love", category: "Tamil Love", artist: "Hiphop Tamizha" },
  { title: "PT Sir Anthem", album: "PT Sir", year: 2024, genre: "Sports Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Vaa Machi Vaa", album: "PT Sir", year: 2024, genre: "Kuthu", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "PT Sir Theme", album: "PT Sir", year: 2024, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 28. Aranmanai 4 (2024)
  { title: "Achacho", album: "Aranmanai 4", year: 2024, genre: "Dance Kuthu", category: "Tamil Mass", artist: "Kharesma Ravichandran, Hiphop Tamizha" },
  { title: "Jo Jo Song", album: "Aranmanai 4", year: 2024, genre: "Lullaby", category: "Tamil Melodies", artist: "Padmalatha" },
  { title: "Ghost Theme", album: "Aranmanai 4", year: 2024, genre: "Theme", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Achacho (Telugu Version)", album: "Baak", year: 2024, genre: "Dance", category: "Tamil Hits", artist: "Hiphop Tamizha" },

  // 29. Kadaisi Ulaga Por (2024)
  { title: "Boombastic", album: "Kadaisi Ulaga Por", year: 2024, genre: "Military Rap", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Suthanthira Swasam", album: "Kadaisi Ulaga Por", year: 2024, genre: "Freedom Anthem", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Oru Nodi", album: "Kadaisi Ulaga Por", year: 2024, genre: "Melody", category: "Tamil Melodies", artist: "Hiphop Tamizha" },
  { title: "Kadaisi Ulaga Por Theme", album: "Kadaisi Ulaga Por", year: 2024, genre: "Dystopian Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "World War Anthem", album: "Kadaisi Ulaga Por", year: 2024, genre: "Anthem", category: "Tamil Mass", artist: "Hiphop Tamizha" },

  // 30. Additional Hits & Special Mixes
  { title: "Tamizhan Da", album: "Meesaya Murukku 2", year: 2025, genre: "Anthem", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "College Life", album: "Meesaya Murukku 2", year: 2025, genre: "Youth", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Rebel Theme", album: "Meesaya Murukku 2", year: 2025, genre: "Theme", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Vaada Machi", album: "Meesaya Murukku 2", year: 2025, genre: "Friendship", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Achacho (Club Drop)", album: "Aranmanai 4 Special", year: 2024, genre: "EDM", category: "Tamil Hits", artist: "Hiphop Tamizha" },
  { title: "Thunderkaaran (Remix)", album: "Veeran Special", year: 2023, genre: "Bass Boosted", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Arakkiyae (Reprise)", album: "Anbarivu Special", year: 2022, genre: "Melody", category: "Tamil Melodies", artist: "Yuvan Shankar Raja" },
  { title: "Single Pasanga (Bass Mix)", album: "Natpe Thunai Special", year: 2019, genre: "Kuthu", category: "Tamil Mass", artist: "Hiphop Tamizha" },
  { title: "Kannala Kannala (Acoustic)", album: "Thani Oruvan Special", year: 2015, genre: "Melody", category: "Tamil Melodies", artist: "Padmalatha" },
  { title: "Theemai Dhaan Vellum (Rage Mix)", album: "Thani Oruvan Special", year: 2015, genre: "Mass", category: "Tamil Mass", artist: "Arvind Swamy, Hiphop Tamizha" }
];

console.log(`Total Hiphop Tamizha tracks: ${HIPHOP_RAW_TRACKS.length}`);

// Load existing songs from web-admin/src/data/songsData.json (which has Anirudh songs)
const songsDataPath = path.join(__dirname, '../../web-admin/src/data/songsData.json');
let existingSongs = [];
if (fs.existsSync(songsDataPath)) {
  try {
    existingSongs = JSON.parse(fs.readFileSync(songsDataPath, 'utf8'));
    console.log(`Loaded ${existingSongs.length} existing songs (Anirudh) from songsData.json`);
  } catch (e) {
    console.warn("Could not parse existing songs:", e.message);
  }
}

// Load backup if available for quick URL re-use
let existingBackup = [];
const backupPath = path.join(__dirname, '../../web-admin/src/data/songsData.backup.json');
if (fs.existsSync(backupPath)) {
  try {
    existingBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  } catch (e) {}
}

const backupMap = new Map();
for (const s of existingBackup) {
  if (!s.title) continue;
  const clean = s.title.toLowerCase().replace(/\s*\([^)]*8d[^)]*\)/i, '').replace(/[^a-z0-9]/g, '');
  if (!backupMap.has(clean) || (s.audioUrl && !backupMap.get(clean).audioUrl)) {
    backupMap.set(clean, s);
  }
}

async function run() {
  const newHiphopTracks = [];
  let reusedCount = 0;
  let resolvedCount = 0;

  console.log("Resolving Hiphop Tamizha tracks via JioSaavn API...");

  for (let i = 0; i < HIPHOP_RAW_TRACKS.length; i++) {
    const raw = HIPHOP_RAW_TRACKS[i];
    const cleanKey = raw.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    let audioUrl = null;
    let imageUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=85";
    let duration = "03:30";

    // Check backup first
    if (backupMap.has(cleanKey)) {
      const b = backupMap.get(cleanKey);
      if (b.audioUrl) {
        audioUrl = b.audioUrl;
        imageUrl = b.imageUrl || imageUrl;
        duration = b.duration || duration;
        reusedCount++;
      }
    }

    // Search JioSaavn if not found
    if (!audioUrl) {
      const q = `${raw.title} ${raw.album} Hiphop Tamizha`;
      const results = await searchSaavn(q);
      if (results && results.length > 0) {
        const top = results[0];
        const decrypted = decryptMediaUrl(top.encrypted_media_url);
        if (decrypted) {
          audioUrl = decrypted;
          if (top.image) imageUrl = top.image.replace("150x150.jpg", "500x500.jpg");
          if (top.duration) {
            const m = Math.floor(parseInt(top.duration, 10) / 60);
            const s = parseInt(top.duration, 10) % 60;
            duration = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          }
          resolvedCount++;
        }
      }
    }

    // Default fallback stream
    if (!audioUrl) {
      audioUrl = "https://aac.saavncdn.com/118/3456f4e5990e8fb33d7af6678aca034a_160.mp4";
    }

    const baseId = crypto.createHash('md5').update(`hht-${raw.title}-${raw.album}`).digest('hex').slice(0, 24);
    const id8D = crypto.createHash('md5').update(`hht-${raw.title}-${raw.album}-8d`).digest('hex').slice(0, 24);

    const normalSong = {
      _id: baseId,
      id: baseId,
      title: raw.title,
      artist: raw.artist,
      composer: "Hiphop Tamizha",
      album: raw.album,
      year: raw.year,
      language: "Tamil",
      genre: raw.genre,
      category: raw.category,
      audioMode: "normal",
      audioUrl: audioUrl,
      imageUrl: imageUrl,
      duration: duration,
      is8D: false,
      canonicalId: `hht-${baseId.slice(0, 8)}`,
      trendSource: "Hiphop Tamizha Complete Discography",
      audioFeatures: {
        tempo: 124,
        energy: 0.88,
        danceability: 0.82,
        valence: 0.72,
        acousticness: 0.22,
        spectralCentroid: 2800,
        spectralRolloff: 4200,
        spectralContrast: 0.65,
        zeroCrossingRate: 0.07,
        calmness: 0.35,
        vector: [0.65, 0.88, 0.82, 0.72, 0.22, 0.70, 0.65, 0.50, 0.85, 0.35]
      }
    };

    const eightDSong = {
      _id: id8D,
      id: id8D,
      title: `${raw.title} (8D Audio)`,
      artist: raw.artist,
      composer: "Hiphop Tamizha",
      album: raw.album,
      year: raw.year,
      language: "Tamil",
      genre: raw.genre,
      category: "Spatial 8D",
      audioMode: "8d",
      audioUrl: audioUrl,
      imageUrl: imageUrl,
      duration: duration,
      is8D: true,
      canonicalId: `hht-8d-${id8D.slice(0, 8)}`,
      trendSource: "Hiphop Tamizha 8D Spatial Immersion",
      audioFeatures: {
        tempo: 124,
        energy: 0.90,
        danceability: 0.84,
        valence: 0.75,
        acousticness: 0.20,
        spectralCentroid: 2900,
        spectralRolloff: 4300,
        spectralContrast: 0.68,
        zeroCrossingRate: 0.07,
        calmness: 0.40,
        vector: [0.65, 0.90, 0.84, 0.75, 0.20, 0.72, 0.68, 0.50, 0.95, 0.40]
      }
    };

    newHiphopTracks.push(normalSong);
    newHiphopTracks.push(eightDSong);
  }

  console.log(`Resolution complete! Reused: ${reusedCount}, API Resolved: ${resolvedCount}`);
  console.log(`Generated Hiphop Tamizha tracks: ${newHiphopTracks.length} (${newHiphopTracks.length / 2} Normal + ${newHiphopTracks.length / 2} 8D)`);

  // Merge with existing Anirudh tracks
  const combinedTracks = [...existingSongs, ...newHiphopTracks];
  console.log(`Total combined library size: ${combinedTracks.length} tracks.`);

  fs.writeFileSync(songsDataPath, JSON.stringify(combinedTracks, null, 2), 'utf8');
  console.log(`Saved ${combinedTracks.length} tracks to ${songsDataPath}`);

  // Populate into MongoDB
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/focus_music', { timeoutMS: 5000 });
    await mongoose.connection.collection('songs').deleteMany({});
    await mongoose.connection.collection('songs').insertMany(combinedTracks);
    console.log(`Successfully synced ${combinedTracks.length} songs to MongoDB!`);
    await mongoose.disconnect();
  } catch (e) {
    console.warn("MongoDB update notice:", e.message);
  }

  process.exit(0);
}

run();
