require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// --- ENV / DB SETUP ---
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- SIMPLE TEST ROUTES ---
app.get("/", (req, res) => {
  res.send("Job Application Tracker API is running");
});

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

// --- JOB API ---
// GET all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,
              company_name,
              job_title,
              status,
              application_date,
              notes,
              created_at,
              updated_at
       FROM job_applications
       ORDER BY application_date DESC NULLS LAST, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// POST create new job
app.post("/api/jobs", async (req, res) => {
  try {
    const { company_name, job_title, status, application_date, notes } = req.body;

    if (!company_name || !job_title) {
      return res.status(400).json({ message: "company_name and job_title are required" });
    }

    const result = await pool.query(
      `INSERT INTO job_applications
         (company_name, job_title, status, application_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        company_name,
        job_title,
        status || "APPLIED",
        application_date || null,
        notes || "",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Failed to create job" });
  }
});

// PUT update an existing job
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, job_title, status, application_date, notes } = req.body;

    const result = await pool.query(
      `UPDATE job_applications
       SET company_name     = $1,
           job_title        = $2,
           status           = $3,
           application_date = $4,
           notes            = $5,
           updated_at       = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        company_name,
        job_title,
        status,
        application_date || null,
        notes || "",
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Failed to update job" });
  }
});

// DELETE a job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM job_applications WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(204).send(); // No content
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
