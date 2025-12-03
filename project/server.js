import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemsRoutes from "./routes/itemRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});