# Environment Variables Reference

## Backend Variables

### Required

| Variable | Purpose | Example | Where to Set |
|----------|---------|---------|--------------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host/db` | Auto-set by Render |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config | `dq15rlo4k` | Render Environment tab |
| `CLOUDINARY_API_KEY` | Cloudinary auth | `893469772259385` | Render Environment tab |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `iOSE-BDr...` | Render Environment tab |
| `NODE_ENV` | Environment | `production` | Render Environment tab |

### Optional

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `PORT` | Server port | Auto-set by Render | Don't set manually |
| `RENDER_DATABASE_URL` | Migration scripts | Same as DATABASE_URL | For clarity in scripts |

---

## Frontend Variables

### Required

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `https://kkp-platform.onrender.com` |

**Important:** Vite requires `VITE_` prefix for env variables!

---

## Local Development (.env)

### backend/.env

```env
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kkp_platform

# Render PostgreSQL (for migrations)
RENDER_DATABASE_URL=postgresql://kkp_db_user:password@dpg-xxx.frankfurt-postgres.render.com/kkp_db

# Cloudinary
CLOUDINARY_CLOUD_NAME=dq15rlo4k
CLOUDINARY_API_KEY=893469772259385
CLOUDINARY_API_SECRET=iOSE-BDrI6LHMB9A1f2TN7MMmfs

# Environment
NODE_ENV=development
```

### frontend/.env

```env
# Local backend
VITE_API_URL=http://localhost:5000
```

### frontend/.env.production

```env
# Production backend
VITE_API_URL=https://kkp-platform.onrender.com
```

---

## Setting Variables on Render

### Via Dashboard

1. Go to service (backend or frontend)
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Enter Key and Value
5. Click "Save Changes"
6. Service auto-redeploys

### Via render.yaml

```yaml
services:
  - type: web
    name: kkp-platform
    envVars:
      - key: NODE_ENV
        value: production
      - key: CLOUDINARY_CLOUD_NAME
        value: dq15rlo4k
      - key: DATABASE_URL
        fromDatabase:
          name: kkp-db
          property: connectionString
```

---

## Security Best Practices

### Never Commit Secrets

```gitignore
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

### Rotate Secrets Periodically

- Cloudinary: Regenerate API Secret every 6 months
- Database: Reset password if exposed
- Update Render environment variables after rotation

### Use Different Values for Each Environment

```javascript
// ❌ BAD - Same credentials everywhere
const apiKey = '12345';

// ✅ GOOD - Environment-specific
const apiKey = process.env.CLOUDINARY_API_KEY;
```

---

## Accessing Variables

### Backend (Node.js)

```javascript
require('dotenv').config();  // Load .env file

const dbUrl = process.env.DATABASE_URL;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const nodeEnv = process.env.NODE_ENV || 'development';
```

### Frontend (Vite)

```javascript
// Must use import.meta.env (NOT process.env)
const apiUrl = import.meta.env.VITE_API_URL;

// Check if running in production
const isProd = import.meta.env.PROD;

// Fallback for development
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## Conditional Logic

### Backend Example

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://kkp-frontend.onrender.com'
    : 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
```

### Frontend Example

```javascript
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? 'http://localhost:5000'
    : 'https://kkp-platform.onrender.com'
);
```

---

## Troubleshooting

### Variable Not Found

**Backend:**
```javascript
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}
```

**Frontend:**
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);

if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL not set, using default');
}
```

### Variable Value Incorrect

1. Check for typos in variable name
2. Verify value in Render dashboard
3. Restart service after changing variables
4. Check .env file for local development

### Vite Variables Not Working

**Common mistakes:**

```javascript
// ❌ Wrong - doesn't work in Vite
const url = process.env.VITE_API_URL;

// ❌ Wrong - missing VITE_ prefix
const url = import.meta.env.API_URL;

// ✅ Correct
const url = import.meta.env.VITE_API_URL;
```

---

## Complete Example

### backend/db.js

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
```

### frontend/src/services/api.js

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export default api;
```

---

## Migration Scripts

For migration scripts that run locally but connect to Render:

```javascript
require('dotenv').config();
const { Pool } = require('pg');

// Use RENDER_DATABASE_URL for clarity
const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Or use DATABASE_URL if only targeting one environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

Both work - `RENDER_DATABASE_URL` makes it clearer you're targeting Render.
