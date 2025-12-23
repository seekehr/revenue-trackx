-- Create the revenue table for Cloudflare D1
CREATE TABLE IF NOT EXISTS revenue (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  timestamp TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_revenue_timestamp ON revenue(timestamp DESC);
