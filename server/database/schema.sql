-- PostgreSQL Schema for Daily Hostel Report System

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
    created_by INT REFERENCES users(id),
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

-- Default Warden user insertion (password: admin123)
-- Hash generated for 'admin123' via bcrypt ($2a$10$wT0/S2tXvH5pL/o4jS.BLeP9L/H4S4C0B6qW7P.C4H8i2S3W5e26i)
INSERT INTO users (username, password_hash, role, full_name)
VALUES ('warden', '$2a$10$8.75rCSt2mGv605w7W7FqO2k... (handled via app init)', 'warden', 'Hostel Warden')
ON CONFLICT (username) DO NOTHING;
