-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE user_role AS ENUM ('donor', 'patient', 'hospital', 'blood_bank');
CREATE TYPE request_status AS ENUM ('pending', 'fulfilled', 'cancelled');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    role user_role NOT NULL,
    location GEOMETRY(Point, 4326), -- PostGIS point
    latitude DECIMAL(10, 8), -- Backup columns if PostGIS is unavailable during local dev
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donors (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    blood_group blood_group NOT NULL,
    last_donation_date DATE,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE hospitals (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) UNIQUE,
    address TEXT NOT NULL
);

CREATE TABLE blood_banks (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE,
    address TEXT NOT NULL
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id),
    blood_group blood_group NOT NULL,
    units_required INTEGER NOT NULL,
    urgency_level VARCHAR(50) NOT NULL,
    status request_status DEFAULT 'pending',
    target_hospital_id INTEGER REFERENCES hospitals(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    blood_bank_id INTEGER REFERENCES blood_banks(user_id) ON DELETE CASCADE,
    blood_group blood_group NOT NULL,
    units_available INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blood_bank_id, blood_group)
);
