// node generate-android-countries.js
const fs = require("fs");
const path = require("path");

// 1) Orijinal dosyaları oku
const countriesPath = path.join(__dirname, "countries.json");
const statesPath = path.join(__dirname, "states.json");

const countries = JSON.parse(fs.readFileSync(countriesPath, "utf8"));
const states = JSON.parse(fs.readFileSync(statesPath, "utf8"));

// 2) iso2 -> { code, name, cities:Set } map'i oluştur
const map = new Map();

countries.forEach((c) => {
  if (!c.iso2 || !c.name) return;
  map.set(c.iso2, {
    code: c.iso2,
    name: c.name,
    cities: new Set(),
  });
});

// 3) states.json içinden country_code'a göre şehirleri / eyaletleri ekle
states.forEach((s) => {
  const code = s.country_code; // states.json'daki alan
  const entry = map.get(code);
  if (!entry) return;

  // Şehir/eyalet ismi olarak state.name'i kullanıyoruz
  if (s.name) {
    entry.cities.add(s.name);
  }
});

// 4) Sonuç: sadece en az 1 şehir içeren ülkeleri al
const result = Array.from(map.values())
  .map((entry) => ({
    code: entry.code,
    name: entry.name,
    cities: Array.from(entry.cities).sort(),
  }))
  .filter((c) => c.cities.length > 0);

// 5) android_countries.json olarak kaydet
const outPath = path.join(__dirname, "android_countries.json");
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

console.log(`Generated ${result.length} countries with cities → ${outPath}`);
