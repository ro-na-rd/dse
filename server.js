import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemsRoutes from "./routes/itemRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import {verifyToken} from "./middleware/authMiddleware.js";

dotenv.config();

// Application Configuration
const config = {
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || "development",
  corsOptions: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
};

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
}).catch((error) => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});

// Serve styled HTML for root route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Server</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 60px 40px;
          border-radius: 10px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }
        h1 {
          color: #667eea;
          margin-bottom: 15px;
          font-size: 2.5em;
        }
        p {
          color: #666;
          font-size: 1.1em;
          margin-bottom: 30px;
        }
        .status { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✓ API Server</h1>
        <p>Server is running on port <span class="status">${PORT}</span></p>
      </div>
    </body>
    </html>
  `);
});