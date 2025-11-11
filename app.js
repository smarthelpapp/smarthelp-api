const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// Basit sağlık kontrolü
app.get("/", (req, res) => {
  res.send("SmartHelp API çalışıyor ✅");
});

// Örnek (şimdilik küçük liste) — sonrasında 1500+ tarif ekleyeceğiz
const RECIPES = [
  { id: 1, title: "Tavuk Izgara", kcal: 420, ingredients: ["tavuk", "tuz", "zeytinyağı"] },
  { id: 2, title: "Tavuk Sote", kcal: 380, ingredients: ["tavuk", "biber", "soğan"] },
  { id: 3, title: "Sebzeli Fırın Tavuk", kcal: 450, ingredients: ["tavuk", "patates", "havuç", "zeytinyağı"] }
];

// /recipes/search?q=tavuk
app.get("/recipes/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const list = RECIPES.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.ingredients.some(i => i.toLowerCase().includes(q))
  );
  res.json(list);
});

app.listen(PORT, () => {
  console.log("API açık :" + PORT);
  console.log("Hizmetiniz yayında 🚀");
});
