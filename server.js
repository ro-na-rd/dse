 import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import { initializeDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemsRoutes from "./routes/itemRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { db, initializeDatabase } from "./config/db.js";

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

// Serve styled HTML for root route
app.get("/", (req, res) => {
  // WRONG - causes the error
res.send(`
  some text
`);
 
});
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }

  console.log("Connected to the database");

  connection.release();

});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});