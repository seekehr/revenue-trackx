# Database Setup

This project uses **Cloudflare D1** for production and **local JSON files** for development.

## Development Mode

In development, the application automatically uses a local JSON file for data storage.

### Setup

No setup required! The JSON database will automatically:
- Create a `.database` directory in the project root
- Generate a `data.json` file to store users and revenue entries
- Persist data between server restarts

### Location

Data is stored in: `.database/data.json`

This directory is gitignored and safe for local development.

## Production Mode (Cloudflare D1)

For production deployment on Cloudflare Pages, the app uses D1 database.

### Setup Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Create D1 Database**:
   ```bash
   npx wrangler d1 create revenue-trackx-db
   ```

4. **Update wrangler.toml**:
   Copy the `database_id` from the output and update `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "revenue-trackx-db"
   database_id = "your-actual-database-id-here"
   ```

5. **Run Migrations**:
   ```bash
   npx wrangler d1 execute revenue-trackx-db --file=./migrations/0001_initial.sql
   ```

6. **Build for Cloudflare Pages**:
   ```bash
   npm run build
   npm run pages:build
   ```

7. **Deploy to Cloudflare Pages**:
   - Push your code to GitHub
   - Connect your repository to Cloudflare Pages
   - Set build command: `npm run build && npm run pages:build`
   - Set build output directory: `.vercel/output/static`
   - Add D1 binding in Pages settings (binding name: `DB`, database: `revenue-trackx-db`)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Revenue Table
```sql
CREATE TABLE revenue (
  id TEXT PRIMARY KEY,              -- Hash of username + passwordHash + timestamp
  username TEXT NOT NULL,           -- User who created this entry
  amount REAL NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (username) REFERENCES users(username)
);
```

## How It Works

The application automatically detects the environment:

- **Development** (`npm run dev`): Uses JSON file storage in `.database/data.json`
- **Production** (Cloudflare Pages with `@cloudflare/next-on-pages`): Uses D1 database via binding

The database abstraction layer (`lib/db/`) handles switching between implementations transparently.

## Key Features

- **Multiple revenue entries per user**: Each user can create many revenue entries over time
- **Revenue ID generation**:
  - On login/signup: password is hashed and stored in cookie along with username
  - On revenue creation: ID = hash(username + passwordHash + timestamp) for uniqueness
  - Each entry is uniquely identified and linked to the user
- **Session cookies**: Stores `username` and `passwordHash` (not plain password)
- Automatic environment detection (no manual configuration needed)
- Type-safe database interface with TypeScript
- Authentication required for all revenue operations
- Full revenue history tracked with timestamps
