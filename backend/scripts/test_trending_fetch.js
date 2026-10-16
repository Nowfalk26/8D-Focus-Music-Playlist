const crypto = require('crypto');

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

async function search(q) {
  const url = 'https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&n=5&p=1&q=' + encodeURIComponent(q);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const data = await res.json();
  return (data.results || []).map(r => ({
    title: r.song ? r.song.replace(/&quot;/g, '"').replace(/&#039;/g, "'") : "",
    album: r.album ? r.album.replace(/&quot;/g, '"').replace(/&#039;/g, "'") : "",
    artist: r.more_info?.singers || r.more_info?.artistMap?.primary_artists?.[0]?.name || "",
    year: r.year,
    url: decryptMediaUrl(r.encrypted_media_url),
    image: r.image ? r.image.replace('150x150.jpg', '500x500.jpg') : ""
  }));
}

async function main() {
  const testQueries = [
    'Manasilaayo Vettaiyan',
    'Hey Minnale Amaran',
    'Spark The GOAT',
    'Katchi Sera',
    'Aasa Kooda',
    'Kaavaalaa Jailer',
    'Badass Leo',
    'Aga Naga Ponniyin Selvan',
    'Megham Karukatha Thiruchitrambalam',
    'Dippam Dappam Kaathuvaakula Rendu Kaadhal'
  ];
  for (const q of testQueries) {
    const items = await search(q);
    const top = items.find(i => i.url) || items[0];
    if (top) {
      console.log('✅ QUERY:', q);
      console.log('   => FOUND:', top.title, '| Album:', top.album, '| Year:', top.year);
      console.log('   => URL:', top.url ? top.url.slice(0, 50) + '...' : 'NONE');
    } else {
      console.log('❌ QUERY:', q, '=> NO MATCH');
    }
  }
}

main();
