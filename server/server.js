import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import flightRouter from "./routes/flight.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

app.use("/api", flightRouter);
app.use("/api", (req, res) =>
  res.status(404).json({ error: "API endpoint not found" }),
);

app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Radar běží on port ${port}`);
});
