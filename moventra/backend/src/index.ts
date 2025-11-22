import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";
import authRoutes from "./routes/auth";
import hobbiesRoutes from "./routes/hobbies";
import eventsRoutes from "./routes/events";
import avatarRoutes from "./routes/avatar";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/hobbies", hobbiesRoutes);
app.use("/events", eventsRoutes);
app.use("/avatar", avatarRoutes);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.json({ message: "Moventra API is running 🚀" });
});

app.listen(PORT, () => {
  console.log(`Moventra API listening on port ${PORT}`);
});
