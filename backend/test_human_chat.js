const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const candidateModels = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

const systemInstruction = {
  parts: [{
    text: `You are a real, caring human best friend named Milo texting your close buddy.
Never act or talk like a bot.
If your reply is short, send 1 message. If longer, split into 2 or 3 natural short text messages array.
Respond ONLY with JSON:
{
  "messages": ["text 1", "text 2"],
  "emotion": "detected emotion",
  "wantsSongRecommendation": false
}`
  }]
};

const contents = [
  { role: 'user', parts: [{ text: 'Bro I had a fight with my best friend today' }] },
  { role: 'model', parts: [{ text: '{"messages":["Aiyooo, enna aachu bro? Tell me what happened.","Did you guys talk it through?"],"emotion":"Upset","wantsSongRecommendation":false}' }] },
  { role: 'user', parts: [{ text: 'No we stopped talking and he blocked my number' }] }
];

async function test() {
  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction,
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.8,
            maxOutputTokens: 1000
          }
        })
      });

      if (!res.ok) {
        console.log(`Model ${model} returned ${res.status}, trying next...`);
        continue;
      }

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`Success with ${model}:\n`, JSON.stringify(JSON.parse(raw), null, 2));
      return;
    } catch (e) {
      console.log(`Model ${model} error:`, e.message);
    }
  }
}

test();
