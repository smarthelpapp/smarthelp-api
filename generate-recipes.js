const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

// ✅ OpenAI API key Render environment'tan okunuyor
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FILE_PATH = path.join(__dirname, "data", "recipes.json");
const NEW_RECIPE_COUNT = 100;

async function generateRecipes() {
  console.log("➡️ Yeni tarifler üretiliyor...");

  // ✅ Mevcut tarifleri oku
  let existingRecipes = [];
  if (fs.existsSync(FILE_PATH)) {
    existingRecipes = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  }

  const existingTitles = existingRecipes.map(r => r.title.toLowerCase());

  const prompt = `
Sen bir yemek tarifi oluşturma botusun.
100 farklı yemek tarifi üret. Türkçe olsun.

FORMAT:
[
 {
   "title": "Acılı Tavuk Sote",
   "kcal": 430,
   "ingredients": ["tavuk", "soğan", "biber", "baharat", "yağ"],
   "tags": ["protein", "ana yemek"]
 }
]
Tekrar etmeyen tarifler üret. Aynı isimden iki tane olmasın. 
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }]
  });

  const parsed = JSON.parse(response.choices[0].message.content);

  let newRecipes = parsed.recipes || parsed || [];
  let addedRecipes = 0;

  newRecipes.forEach(recipe => {
    if (!existingTitles.includes(recipe.title.toLowerCase())) {
      recipe.id = existingRecipes.length + 1;
      existingRecipes.push(recipe);
      existingTitles.push(recipe.title.toLowerCase());
      addedRecipes++;
    }
  });

  fs.writeFileSync(FILE_PATH, JSON.stringify(existingRecipes, null, 2));

  console.log(`✅ ${addedRecipes} tarif eklendi.`);
  console.log(`📌 Toplam tarif sayısı: ${existingRecipes.length}`);
}

generateRecipes().catch(err => console.error("🚨 HATA:", err));
