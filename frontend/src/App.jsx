import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    company_name: "",
    job_title: "",
    status: "APPLIED",
    application_date: "",
    notes: "",
  });

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/jobs`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Create job
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.job_title) {
      setError("Company name and job title are required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create job");
      const newJob = await res.json();

      // Add to list and clear form
      setJobs((prev) => [newJob, ...prev]);
      setForm({
        company_name: "",
        job_title: "",
        status: "APPLIED",
        application_date: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Delete job
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job application?")) return;

    try {
      const res = await fetch(`${API_URL}/api/jobs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job");

      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Job Application Tracker</h1>
      <p style={{ marginBottom: "1.5rem", color: "#555" }}>
        React + Express + PostgreSQL demo project
      </p>

      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#ffe5e5",
            border: "1px solid #ffaaaa",
            borderRadius: "4px",
            color: "#990000",
          }}
        >
          {error}
        </div>
      )}

      {/* Form */}
      <section
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "6px",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Add new application</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "0.75rem" }}
        >
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <label>
                Company name<span style={{ color: "red" }}> *</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.4rem" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>
                Job title<span style={{ color: "red" }}> *</span>
              </label>
              <input
                type="text"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.4rem" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div>
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ padding: "0.4rem" }}
              >
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label>Application date</label>
              <input
                type="date"
                name="application_date"
                value={form.application_date || ""}
                onChange={handleChange}
                style={{ padding: "0.4rem" }}
              />
            </div>
          </div>

          <div>
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              style={{ width: "100%", padding: "0.4rem" }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: saving ? "#888" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "default" : "pointer",
              width: "150px",
            }}
          >
            {saving ? "Saving..." : "Add job"}
          </button>
        </form>
      </section>

      {/* Jobs list */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <h2>My applications</h2>
          <button
            onClick={fetchJobs}
            disabled={loading}
            style={{
              padding: "0.3rem 0.7rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#f7f7f7",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && jobs.length === 0 && <p>Loading...</p>}

        {jobs.length === 0 && !loading && <p>No applications yet.</p>}

        {jobs.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Applied on</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={tdStyle}>{job.company_name}</td>
                  <td style={tdStyle}>{job.job_title}</td>
                  <td style={tdStyle}>{job.status}</td>
                  <td style={tdStyle}>
                    {job.application_date
                      ? new Date(job.application_date).toLocaleDateString()
                      : ""}
                  </td>
                  <td style={tdStyle}>{job.notes}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(job.id)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#ff4d4f",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                    {/* later we can add Edit */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "0.5rem",
  borderBottom: "1px solid #ddd",
  backgroundColor: "#f2f2f2",
};

const tdStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
};

export default App;
