const express = require("express");
const app = express();
const cors = require("cors");
const recipes = require("./data/recipes.json"); // ✅ JSON doğru yerden okunuyor

app.use(cors());
app.use(express.json());

// Tüm tarifleri getir
app.get("/recipes", (req, res) => {
  res.json(recipes);
});

// Kelimeye göre filtrele
app.get("/recipes/search", (req, res) => {
  const q = req.query.q?.toLowerCase();
  const result = recipes.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.ingredients.some((i) => i.toLowerCase().includes(q))
  );
  res.json(result);
});

app.get("/", (req, res) => {
  res.json({ message: "SmartHelp API Running ✅" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ API çalışıyor → Port: ${PORT}`));
