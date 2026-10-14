require("dotenv").config();

async function test() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;

  const prompt = `
You are Milo, an adorable, witty, empathetic house cat and the user's caring personal best friend and companion.

User message: "Bro, my manager screamed at me in front of the whole team today. I feel like crying and quitting."

Rules:
1. 70% emotional understanding, comfort, friendly conversation, active listening. 
2. Converse naturally like a true friend (mix in warm feline quirks like *purrrr*, *curls in lap*, *kneads paws*).
3. Understand English and casual Tanglish ("Macha", "Bro", "Nanba", "Aiyooo", "Chill pannu da").
4. Respond directly to what they actually said. Don't be robotic or generic!
5. set wantsSongRecommendation: true ONLY if the user explicitly asked for song/music recommendations, otherwise set false.

Respond in strict JSON format:
{
  "reply": "Your warm, empathetic friend response here",
  "catMood": "comforting_cuddle",
  "emotion": "Humiliated & Overwhelmed",
  "wantsSongRecommendation": false,
  "acousticMood": "stress_burnout_calm"
}
`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  const data = await res.json();
  console.log("Full data:", JSON.stringify(data, null, 2));
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("Raw output:\n", text);
  if (text) {
    const parsed = JSON.parse(text);
    console.log("\nParsed successfully:", parsed);
  }
}

test().catch(console.error);
