import { Router } from "express";
import fs from "fs";
import path from "path";
import zlib from "zlib";

const router = Router();

// Countries
router.get("/countries", (req, res) => {
  const filePath = path.join(__dirname, "..", "location-data", "countries.json");
  const content = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(content);
  res.json(data);
});

// States
router.get("/states", (req, res) => {
  const { country_code } = req.query;

  const filePath = path.join(__dirname, "..", "location-data", "states.json");
  const content = fs.readFileSync(filePath, "utf-8");
  let states = JSON.parse(content);

  if (country_code) {
    states = states.filter((s: any) => s.country_code === country_code);
  }

  res.json(states);
});

// Cities (gzip)
router.get("/cities", (req, res) => {
  const { country_id, state_id } = req.query;

  const filePath = path.join(__dirname, "..", "location-data", "cities.json.gz");

  const buffer = fs.readFileSync(filePath);
  const jsonString = zlib.gunzipSync(buffer).toString("utf-8");
  let cities = JSON.parse(jsonString);

  if (country_id) {
    cities = cities.filter((c: any) => c.country_id == Number(country_id));
  }

  if (state_id) {
    cities = cities.filter((c: any) => c.state_id == Number(state_id));
  }

  res.json(cities);
});

export default router;
