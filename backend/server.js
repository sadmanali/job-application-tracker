require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// 1. Read env variables
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Simple test route
app.get("/", (req, res) => {
  res.send("Job Application Tracker API is running");
});

// 4. DB health check route
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

// 5. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
