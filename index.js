// SmartHelp API — 5 modül + basit sohbet (mock, anahtarsız)
import express from "express";
import cors from "cors";
const app = express();
app.use(cors()); app.use(express.json());

app.get("/health", (req, res) => res.send("ok"));

const RECIPES = [
  { id:1, title:"Mercimek Çorbası", kcal:220, ingredients:["mercimek","soğan","havuç","su","tuz"], tags:["vejetaryen"] },
  { id:2, title:"Izgara Tavuk + Salata", kcal:480, ingredients:["tavuk","zeytinyağı","marul","domates","limon"], tags:["protein","keto"] },
  { id:3, title:"Zeytinyağlı Fasulye", kcal:300, ingredients:["taze fasulye","soğan","zeytinyağı","domates","tuz"], tags:["vegan","vejetaryen"] },
  { id:4, title:"Karnıyarık", kcal:650, ingredients:["patlıcan","kıyma","soğan","domates","biber","salça","yağ","tuz"], tags:["klasik"] },
  { id:5, title:"Keto Omlet", kcal:350, ingredients:["yumurta","tereyağı","peynir","tuz"], tags:["keto","kahvaltı"] },
];
const MOVIES = [
  { id:1, title:"The Social Dilemma", year:2020, genres:["belgesel","drama"], mood:["düşündüren"] },
  { id:2, title:"Inception", year:2010, genres:["bilimkurgu","gerilim"], mood:["zihin açıcı"] },
  { id:3, title:"The Intouchables", year:2011, genres:["dram","komedi"], mood:["iyi hissettiren"] },
  { id:4, title:"Interstellar", year:2014, genres:["bilimkurgu","dram"], mood:["epik"] },
  { id:5, title:"Parasite", year:2019, genres:["dram","gerilim"], mood:["övgü alan"] },
];
let TASKS = [
  { id:1, title:"Toplantı notlarını gözden geçir", isDone:false, dueAt: Date.now()+3600000 },
  { id:2, title:"30 dk yürüyüş", isDone:false, dueAt: Date.now()+7200000 },
];

app.get("/daily/routine", (req,res)=>{
  const pantry = ["soğan","domates","patlıcan","kıyma","zeytinyağı","yumurta"];
  let best=null, bestScore=-1e9;
  for(const r of RECIPES){
    const have=r.ingredients.filter(x=>pantry.includes(x));
    const missing=r.ingredients.filter(x=>!pantry.includes(x));
    const s=have.length - missing.length*0.2;
    if(s>bestScore){ bestScore=s; best={...r,missing}; }
  }
  res.json({
    tasks:TASKS.filter(t=>!t.isDone),
    meal:best,
    style:{tops:["Beyaz tişört"], bottoms:["Lacivert jean"], shoes:["Spor ayakkabı"], extras:["Hafif mont"]},
    watch:MOVIES[0],
    weather:{summary:"Parçalı bulutlu ~18°C"}
  });
});

app.get("/recipes/by-ingredients", (req,res)=>{
  const got=String(req.query.ingredients||"").toLowerCase().split(",").map(s=>s.trim()).filter(Boolean);
  const diet=String(req.query.diet||"").toLowerCase();
  const pool = RECIPES.filter(r => !diet ? true : r.tags.map(t=>t.toLowerCase()).includes(diet));
  const scored = pool.map(r=>{
    const have=r.ingredients.filter(x=>got.includes(x));
    const missing=r.ingredients.filter(x=>!got.includes(x));
    const score=have.length - missing.length*0.2;
    return {...r,missing,_score:score};
  }).sort((a,b)=>b._score-a._score).map(({_score,...r})=>r);
  res.json(scored);
});
app.get("/recipes/search", (req,res)=>{
  const q=String(req.query.q||"").toLowerCase();
  const diet=String(req.query.diet||"").toLowerCase();
  const pool=RECIPES.filter(r=>!diet?true:r.tags.map(t=>t.toLowerCase()).includes(diet));
  const out=pool.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.tags.some(t=>t.toLowerCase().includes(q)) ||
    r.ingredients.some(i=>i.toLowerCase().includes(q))
  );
  res.json(out);
});

app.get("/watch/recommend", (req,res)=>{
  const q=String(req.query.q||"").toLowerCase();
  const out = !q ? MOVIES :
    MOVIES.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.genres.some(g=>g.toLowerCase().includes(q)) ||
      m.mood.some(mo=>mo.toLowerCase().includes(q))
    );
  res.json(out);
});

app.get("/tasks",(req,res)=>res.json(TASKS));
app.post("/tasks",(req,res)=>{
  const title=String((req.body&&req.body.title)||"").trim();
  if(!title) return res.status(400).json({error:"title gerekli"});
  const nextId=TASKS.length?Math.max(...TASKS.map(t=>t.id))+1:1;
  const t={id:nextId,title,isDone:false,dueAt:null}; TASKS.unshift(t); res.json(t);
});
app.post("/tasks/:id/done",(req,res)=>{
  const id=Number(req.params.id);
  TASKS=TASKS.map(t=>t.id===id?{...t,isDone:true}:t);
  res.json({ok:true});
});

app.get("/style/suggest",(req,res)=>{
  const occasion=String(req.query.occasion||"günlük").toLowerCase();
  const weather=String(req.query.weather||"serin").toLowerCase();
  const gender=String(req.query.gender||"nötr").toLowerCase();
  const base={tops:[],bottoms:[],shoes:[],extras:[]};
  if(occasion.includes("iş")){ base.tops.push("Oxford gömlek"); base.bottoms.push("Chino"); base.shoes.push("Loafer"); }
  else if(occasion.includes("spor")){ base.tops.push("Spor tişört"); base.bottoms.push("Eşofman"); base.shoes.push("Koşu ayakkabısı"); }
  else if(occasion.includes("davet")){ base.tops.push("Şık gömlek/Bluz"); base.bottoms.push("Klasik pantolon/Etek"); base.shoes.push("Topuklu/Derby"); }
  else { base.tops.push("Basic tişört"); base.bottoms.push("Jean"); base.shoes.push("Sneaker"); }
  if(weather==="sıcak") base.extras.push("Şapka, güneş gözlüğü");
  if(weather==="ılık")  base.extras.push("Hafif ceket");
  if(weather==="serin") base.extras.push("Triko veya ince mont");
  if(weather==="soğuk") base.extras.push("Kaban, atkı");
  res.json({ occasion, weather, gender, ...base });
});

app.post("/chat",(req,res)=>{
  const text=(req.body&&String(req.body.text||"").toLowerCase())||"";
  if(!text) return res.json({reply:"Yemek, film, ev işleri, stil, günlük plan hakkında sorabilirsin."});
  if(text.includes("yemek")) return res.json({reply:"/recipes/by-ingredients ile malzemeden tarif; /recipes/search?q= ile arama yap."});
  if(text.includes("film")||text.includes("dizi")) return res.json({reply:"/watch/recommend?q= tür/isim yazarak öneri al."});
  if(text.includes("stil")||text.includes("kombin")) return res.json({reply:"/style/suggest?occasion=iş&weather=serin&gender=erkek gibi deneyebilirsin."});
  if(text.includes("ev işi")||text.includes("görev")) return res.json({reply:"/tasks ile listele, POST /tasks ile ekle, POST /tasks/:id/done ile tamamla."});
  return res.json({reply:"Şunlarda hemen yardımcıyım: Yemek, Film, Ev İşleri, Stil, Günlük Plan. Birini yaz 😊"});
});

const PORT=process.env.PORT||3000;
app.listen(PORT, ()=>console.log("API on :"+PORT));
