import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await db.getConnection();

    try {
      await connection.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
      );
      res.status(201).json({ message: "User registered successfully" });
    } finally {
      connection.release();
    }
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const connection = await db.getConnection();

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }

      const match = await bcrypt.compare(password, rows[0].password);

      if (!match) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.json({ message: "Login successful", token, userId: rows[0].id });
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};