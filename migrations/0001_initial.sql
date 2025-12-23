-- Create users table
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create revenue table (multiple entries per user)
-- id is hash of username + hashed password + timestamp
CREATE TABLE IF NOT EXISTS revenue (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  amount REAL NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (username) REFERENCES users(username)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_revenue_username ON revenue(username);
CREATE INDEX IF NOT EXISTS idx_revenue_timestamp ON revenue(timestamp DESC);
