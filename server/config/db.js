const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// In-memory / file fallback store if PostgreSQL service is offline
const fallbackStoreFile = path.join(__dirname, 'fallback_data.json');
let isPostgresConnected = false;

const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'hostel_db',
      password: process.env.PGPASSWORD || 'postgres',
      port: parseInt(process.env.PGPORT || '5432', 10),
      connectionTimeoutMillis: 3000,
    };

const pool = new Pool(connectionConfig);

// In-memory storage for fallback
let fallbackData = {
  users: [],
  reports: []
};

// Load fallback file if exists
function loadFallback() {
  try {
    if (fs.existsSync(fallbackStoreFile)) {
      const raw = fs.readFileSync(fallbackStoreFile, 'utf8');
      const parsed = JSON.parse(raw);
      fallbackData.users = parsed.users || [];
      fallbackData.reports = parsed.reports || [];
    } else {
      saveFallback();
    }
  } catch (e) {
    console.error('Fallback store load error:', e.message);
  }
}

// Synchronously load fallback store at startup
loadFallback();

function saveFallback() {
  try {
    fs.writeFileSync(fallbackStoreFile, JSON.stringify(fallbackData, null, 2), 'utf8');
  } catch (e) {
    console.error('Fallback store save error:', e.message);
  }
}

// Seed default admin/warden and deanadmin users in fallback
async function initFallbackSeed() {
  loadFallback();
  
  // Seed Warden
  let existingWarden = fallbackData.users.find(u => u.username === 'warden');
  let isWardenValid = existingWarden ? await bcrypt.compare('admin123', existingWarden.password_hash) : false;

  if (!existingWarden || !isWardenValid) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    if (!existingWarden) {
      fallbackData.users.push({
        id: 1,
        username: 'warden',
        password_hash: hash,
        role: 'warden',
        full_name: 'Chief Hostel Warden',
        created_at: new Date().toISOString()
      });
    } else {
      existingWarden.password_hash = hash;
    }
  }

  // Seed Dean Admin
  let existingDean = fallbackData.users.find(u => u.username === 'deanadmin');
  let isDeanValid = existingDean ? await bcrypt.compare('admin123', existingDean.password_hash) : false;

  if (!existingDean || !isDeanValid) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    if (!existingDean) {
      fallbackData.users.push({
        id: 2,
        username: 'deanadmin',
        password_hash: hash,
        role: 'dean',
        full_name: 'Dean (Student Affairs)',
        created_at: new Date().toISOString()
      });
    } else {
      existingDean.password_hash = hash;
    }
  }

  saveFallback();
}

async function initDb() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL Database!');
    isPostgresConnected = true;

    // Run Table Creations
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'warden',
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_reports (
        id SERIAL PRIMARY KEY,
        hostel_name VARCHAR(100) NOT NULL DEFAULT 'BOYS HOSTEL',
        report_date DATE NOT NULL,
        warden_signature_name VARCHAR(150),
        dean_approval_remarks TEXT,
        maintenance_work TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_attendance (
        id SERIAL PRIMARY KEY,
        report_id INT REFERENCES daily_reports(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        institution_code VARCHAR(50) NOT NULL,
        total_admitted INT NOT NULL DEFAULT 0,
        students_present INT NOT NULL DEFAULT 0,
        absent_with_permission INT NOT NULL DEFAULT 0,
        absent_without_permission INT NOT NULL DEFAULT 0,
        unpermitted_student_names TEXT DEFAULT '',
        time_informed_parents VARCHAR(50) DEFAULT '',
        parent_contact_no VARCHAR(50) DEFAULT '',
        remarks TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS mess_report (
        id SERIAL PRIMARY KEY,
        report_id INT REFERENCES daily_reports(id) ON DELETE CASCADE,
        breakfast_feedback TEXT DEFAULT 'Okay',
        lunch_feedback TEXT DEFAULT 'Okay',
        dinner_feedback TEXT DEFAULT 'Okay'
      );

      CREATE TABLE IF NOT EXISTS committee_visits (
        id SERIAL PRIMARY KEY,
        report_id INT REFERENCES daily_reports(id) ON DELETE CASCADE,
        bh_ii_status VARCHAR(10) DEFAULT 'Yes',
        omv_status VARCHAR(10) DEFAULT 'Yes',
        sgn_status VARCHAR(10) DEFAULT 'Yes',
        jayameena_status VARCHAR(10) DEFAULT 'Yes',
        remarks TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS security_attendance (
        id SERIAL PRIMARY KEY,
        report_id INT REFERENCES daily_reports(id) ON DELETE CASCADE,
        designation VARCHAR(50) NOT NULL,
        allotted_nos INT DEFAULT 0,
        present_day INT DEFAULT 0,
        present_night INT DEFAULT 0,
        absent_day INT DEFAULT 0,
        absent_night INT DEFAULT 0,
        vacancy_day INT DEFAULT 0,
        vacancy_night INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS housekeeping_attendance (
        id SERIAL PRIMARY KEY,
        report_id INT REFERENCES daily_reports(id) ON DELETE CASCADE,
        designation VARCHAR(50) NOT NULL,
        allotted_nos INT DEFAULT 0,
        present_count INT DEFAULT 0,
        absent_count INT DEFAULT 0,
        vacancy_count INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS warden_attendance (
        id SERIAL PRIMARY KEY,
        report_id INT REFERENCES daily_reports(id) ON DELETE CASCADE,
        allotted_nos INT DEFAULT 0,
        present_count INT DEFAULT 0,
        absent_count INT DEFAULT 0,
        vacancy_count INT DEFAULT 0
      );
    `);

    // Check & Seed initial warden and deanadmin users
    const wardenRes = await client.query('SELECT * FROM users WHERE username = $1', ['warden']);
    if (wardenRes.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await client.query(
        'INSERT INTO users (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4)',
        ['warden', hash, 'warden', 'Chief Hostel Warden']
      );
      console.log('Seeded initial warden user into PostgreSQL DB (warden / admin123)');
    }

    const deanRes = await client.query('SELECT * FROM users WHERE username = $1', ['deanadmin']);
    if (deanRes.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await client.query(
        'INSERT INTO users (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4)',
        ['deanadmin', hash, 'dean', 'Dean (Student Affairs)']
      );
      console.log('Seeded initial deanadmin user into PostgreSQL DB (deanadmin / admin123)');
    }

    client.release();
  } catch (err) {
    console.warn('PostgreSQL connection attempt failed or offline:', err.message);
    console.log('Activating transparent local storage fallback. App remains fully operational!');
    isPostgresConnected = false;
    await initFallbackSeed();
  }
}

module.exports = {
  pool,
  initDb,
  isPostgresConnected: () => isPostgresConnected,
  fallbackData,
  saveFallback
};
