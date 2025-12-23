-- Create users table
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create revenue table (one entry per user)
-- id is hash of username + hashed password
CREATE TABLE IF NOT EXISTS revenue (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
