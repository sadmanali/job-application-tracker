# 1. Clone the repo
git clone https://github.com/<your-username>/job-application-tracker-react-express.git
cd job-application-tracker-react-express

# ----------------------------------------------------
# 2. PostgreSQL setup
# ----------------------------------------------------

# Enter PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE job_tracker;

# Connect to it
\c job_tracker;

# Create table
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    company_name      VARCHAR(255) NOT NULL,
    job_title         VARCHAR(255) NOT NULL,
    status            VARCHAR(50)  NOT NULL DEFAULT 'APPLIED',
    application_date  DATE,
    notes             TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

# Exit PostgreSQL
\q

# ----------------------------------------------------
# 3. Backend setup
# ----------------------------------------------------
cd backend

# Install dependencies
npm install

# Create environment file
# (Create backend/.env manually with the following values)
# PORT=5000
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=job_tracker
# DB_USER=postgres
# DB_PASSWORD=your_password_here

# Start backend server
npm run dev

# Backend runs at:
# http://localhost:5000/
# http://localhost:5000/health

# ----------------------------------------------------
# 4. Frontend setup
# ----------------------------------------------------
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs at:
# http://localhost:5173
