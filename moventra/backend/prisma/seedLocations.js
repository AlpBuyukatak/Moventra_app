const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function loadJson(fileName) {
  const filePath = path.join(__dirname, "location-data", fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

async function main() {
  console.log("Loading JSON files...");
  const countriesJson = loadJson("countries.json");
  const statesJson = loadJson("states.json");
  const citiesJson = loadJson("cities.json");

  console.log("Seeding countries...");
  // Örnek: repo formatına göre alan isimleri değişebilir
  await prisma.country.createMany({
    data: countriesJson.map((c) => ({
      id: c.id,
      name: c.name,
      iso2: c.iso2 || null,
      iso3: c.iso3 || null,
    })),
    skipDuplicates: true,
  });

  console.log("Seeding states...");
  await prisma.state.createMany({
    data: statesJson.map((s) => ({
      id: s.id,
      name: s.name,
      countryId: s.country_id, // JSON'da country_id diye geçiyor
    })),
    skipDuplicates: true,
  });

  console.log("Seeding cities...");
  // Büyük dataset, istersen chunk'la; burada direkt basit hali:
  const chunkSize = 5000;
  for (let i = 0; i < citiesJson.length; i += chunkSize) {
    const chunk = citiesJson.slice(i, i + chunkSize);
    console.log(
      `Seeding cities chunk ${i} – ${i + chunk.length} / ${citiesJson.length}`
    );
    await prisma.city.createMany({
      data: chunk.map((city) => ({
        id: city.id,
        name: city.name,
        countryId: city.country_id,
        stateId: city.state_id || null,
      })),
      skipDuplicates: true,
    });
  }

  console.log("Done seeding locations ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
