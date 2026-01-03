# Render Deployment Guide - Full-Stack Apps

> **Skill Type:** Domain Knowledge
> **For:** Deploying KKP Platform to Render.com (Backend + Frontend + Database)
> **Auto-activates when:** Working with deployment, Render configuration, or production issues

---

## What This Skill Provides

This skill guides you through deploying full-stack Node.js/React applications to Render.com, with specific patterns for KKP Platform including Express.js backend, React frontend, PostgreSQL database, and Cloudinary file storage.

---

## Render Service Overview

### KKP Platform Architecture on Render

```
┌─────────────────────────────────────────────────────────┐
│                  RENDER.COM SERVICES                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Static Site)                                 │
│  ├─ URL: https://kkp-frontend.onrender.com             │
│  ├─ Build: npm install && npm run build                │
│  └─ Publish: frontend/dist/                            │
│                                                          │
│  Backend (Web Service)                                  │
│  ├─ URL: https://kkp-platform.onrender.com             │
│  ├─ Build: cd backend && npm install                   │
│  ├─ Start: cd backend && node server.js                │
│  └─ Env: DATABASE_URL, CLOUDINARY_*                    │
│                                                          │
│  Database (PostgreSQL)                                  │
│  ├─ Region: Frankfurt                                   │
│  ├─ Plan: Free                                          │
│  └─ URL: postgresql://user:pass@host/db                │
│                                                          │
└─────────────────────────────────────────────────────────┘
           │                    │
           └────────────────────┘
                External
           ┌────────────────────┐
           │   CLOUDINARY.COM    │
           │   (PDF Storage)     │
           └────────────────────┘
```

---

## Backend Deployment (Express.js)

### 1. Service Configuration

**Service Type:** Web Service
**Environment:** Node

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && node server.js
```

**Example from KKP Platform:**
```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://kkp-frontend.onrender.com'
    : 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/kalite-kontrol', require('./routes/kaliteKontrol'));
app.use('/api/tum-surec', require('./routes/tumSurec'));
// ... other routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Environment Variables

**Required Variables:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | Auto-set by Render |
| `RENDER_DATABASE_URL` | Same as DATABASE_URL | For migration scripts |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config | `dq15rlo4k` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `893469772259385` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `iOSE-BDrI...` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | Auto-set by Render |

**Setting Environment Variables:**

1. Go to Render Dashboard
2. Select backend service
3. Click "Environment" tab
4. Add each variable
5. Save changes
6. Service auto-redeploys

**Security:**
- Never commit `.env` to git
- Use Render's environment variable UI
- Rotate secrets periodically

### 3. Database Connection

**Pattern from KKP Platform:**

```javascript
// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
```

**Key Points:**
- `DATABASE_URL` auto-set by Render when database linked
- SSL required in production
- `rejectUnauthorized: false` needed for Render's SSL certs

### 4. CORS Configuration

**Development vs Production:**

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://kkp-frontend.onrender.com',
        'https://your-custom-domain.com'  // If using custom domain
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

**Common CORS Issues:**

**Issue:** `Access-Control-Allow-Origin` error
**Fix:** Ensure frontend URL is in `origin` array

**Issue:** Cookies not sent
**Fix:** Set `credentials: true` in CORS and use `withCredentials` in axios

---

## Frontend Deployment (React + Vite)

### 1. Service Configuration

**Service Type:** Static Site

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Publish Directory:**
```
frontend/dist
```

**Example vite.config.js:**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable for production
    minify: 'terser'
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
```

### 2. Environment Variables

**Frontend .env:**

```env
VITE_API_URL=https://kkp-platform.onrender.com
```

**Using in code:**

```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

export default api;
```

**Pattern from KKP Platform:**

```javascript
// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const kaliteKontrolAPI = {
  getSiparisler: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/kalite-kontrol/siparisler`);
    return response.data;
  },
  // ... other endpoints
};
```

### 3. Build Optimization

**Package.json scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Optimization tips:**
- Remove console.logs in production
- Minimize bundle size (code splitting)
- Optimize images before upload
- Use lazy loading for routes

---

## Database Setup (PostgreSQL)

### 1. Creating Database

**Steps:**

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name:** `kkp-db`
   - **Database:** `kkp_db`
   - **User:** Auto-generated (e.g., `kkp_db_user`)
   - **Region:** Frankfurt (or closest to backend)
   - **Plan:** Free (or paid for production)

4. Click "Create Database"
5. Wait for provisioning (~2 minutes)

### 2. Linking to Backend

**Option 1 - Automatic (Recommended):**

1. Go to backend service settings
2. Click "Environment" tab
3. Under "Add from Database", select your database
4. DATABASE_URL auto-added

**Option 2 - Manual:**

1. Copy database "External Database URL"
2. Add as environment variable in backend
3. Variable name: `DATABASE_URL` or `RENDER_DATABASE_URL`

### 3. Running Migrations

**After database created:**

```bash
# From local machine, run migration scripts
cd backend
node migrate-surec-schema.js
node sync-recete-to-render.js
# ... other migration scripts
```

**Pattern from KKP Platform:**

```javascript
// backend/migrate-script.js
require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await renderPool.connect();
  try {
    await client.query('BEGIN');

    // Your migration queries
    await client.query('CREATE TABLE IF NOT EXISTS...');

    await client.query('COMMIT');
    console.log('✅ Migration completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await renderPool.end();
  }
}

migrate();
```

---

## Cloudinary Integration (File Storage)

### Why Cloudinary?

**Problem:** Render uses ephemeral filesystem
- Uploaded files disappear on service restart
- No persistent local storage on free tier

**Solution:** Cloudinary for cloud file storage
- Persistent storage
- CDN delivery
- Free tier: 25 GB storage, 25 GB bandwidth

### 1. Cloudinary Setup

**Steps:**

1. Sign up at https://cloudinary.com
2. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

3. Add to backend environment variables:
   ```env
   CLOUDINARY_CLOUD_NAME=dq15rlo4k
   CLOUDINARY_API_KEY=893469772259385
   CLOUDINARY_API_SECRET=iOSE-BDrI6LHMB9A1f2TN7MMmfs
   ```

### 2. Backend Integration

**Install packages:**

```bash
cd backend
npm install cloudinary streamifier
```

**Configuration:**

```javascript
// At top of route file
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

**Upload pattern (from teknikalResimler.js):**

```javascript
const uploadToCloudinary = (buffer, filename, kategoriId) => {
  return new Promise((resolve, reject) => {
    const safeName = filename
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');

    const publicId = `${kategoriId}/${Date.now()}-${safeName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',  // For PDFs, use 'raw'
        public_id: publicId,
        folder: `teknik-resimler/${kategoriId}`
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Usage in route
router.post('/upload', upload.single('dosya'), async (req, res) => {
  try {
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.body.kategori_id
    );

    // Save result.secure_url to database
    await pool.query(`
      INSERT INTO teknik_resimler_dosyalar (kategori_id, dosya_adi, dosya_yolu, dosya_boyutu)
      VALUES ($1, $2, $3, $4)
    `, [req.body.kategori_id, req.file.originalname, result.secure_url, req.file.size]);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

### 3. Migrating Existing Files

**Script pattern (from upload-pdfs-to-cloudinary.js):**

```javascript
const cloudinary = require('cloudinary').v2;
const pool = require('./db');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadExistingFiles() {
  const files = await pool.query('SELECT * FROM teknik_resimler_dosyalar');

  for (const file of files.rows) {
    try {
      // Upload local file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.dosya_yolu, {
        resource_type: 'raw',
        public_id: `teknik-resimler/${file.kategori_id}/${file.dosya_adi}`,
        folder: `teknik-resimler/${file.kategori_id}`
      });

      // Update database with Cloudinary URL
      await pool.query(`
        UPDATE teknik_resimler_dosyalar
        SET dosya_yolu = $1
        WHERE id = $2
      `, [uploadResult.secure_url, file.id]);

      console.log(`✅ Uploaded: ${file.dosya_adi}`);
    } catch (error) {
      console.error(`❌ Failed: ${file.dosya_adi}`, error.message);
    }
  }
}
```

---

## Common Deployment Issues

### Issue 1: Service Won't Start

**Symptoms:**
- "Deploy failed" error
- Service status: "Build failed"

**Common Causes:**

1. **Missing dependencies:**
   ```json
   // Ensure all deps in package.json
   {
     "dependencies": {
       "express": "^4.18.0",
       "pg": "^8.11.0",
       // ... all required packages
     }
   }
   ```

2. **Wrong start command:**
   - Check Build Command
   - Check Start Command
   - Ensure paths are correct (cd backend)

3. **Port binding:**
   ```javascript
   // Use process.env.PORT (Render assigns port)
   const PORT = process.env.PORT || 5000;
   app.listen(PORT);
   ```

### Issue 2: Frontend Can't Reach Backend

**Symptoms:**
- Network errors in browser console
- API calls fail with CORS error

**Fixes:**

1. **Check CORS configuration:**
   ```javascript
   app.use(cors({
     origin: 'https://kkp-frontend.onrender.com',  // Frontend URL
     credentials: true
   }));
   ```

2. **Verify API base URL:**
   ```javascript
   // frontend/.env
   VITE_API_URL=https://kkp-platform.onrender.com
   ```

3. **Check backend is running:**
   - Visit backend URL directly
   - Should see response (not error page)

### Issue 3: Database Connection Fails

**Symptoms:**
- "ECONNREFUSED" errors
- "relation does not exist" errors

**Fixes:**

1. **Verify DATABASE_URL is set:**
   - Check backend environment variables
   - Should be auto-set when database linked

2. **Check SSL configuration:**
   ```javascript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }  // Required for Render
   });
   ```

3. **Run migrations:**
   - Tables may not exist yet
   - Run migration scripts from local

### Issue 4: Files Not Persisting

**Symptom:** Uploaded files disappear after restart

**Cause:** Render uses ephemeral filesystem

**Fix:** Use Cloudinary (see Cloudinary Integration above)

### Issue 5: Environment Variables Not Working

**Symptoms:**
- `undefined` values
- "Missing env variable" errors

**Fixes:**

1. **Backend (.env):**
   ```javascript
   require('dotenv').config();  // At top of file
   ```

2. **Frontend (Vite):**
   ```javascript
   // Must prefix with VITE_
   VITE_API_URL=https://...

   // Access with import.meta.env
   const url = import.meta.env.VITE_API_URL;
   ```

3. **Render Dashboard:**
   - Set variables in service settings
   - Not in .env file (that's for local)

---

## Deployment Workflow

### Initial Deployment

**Step 1 - Prepare Code:**
- [ ] Test locally
- [ ] All dependencies in package.json
- [ ] .env variables documented
- [ ] Build scripts configured

**Step 2 - Create Database:**
- [ ] Create PostgreSQL service on Render
- [ ] Note database credentials
- [ ] Wait for provisioning

**Step 3 - Deploy Backend:**
- [ ] Create Web Service
- [ ] Connect to GitHub repo
- [ ] Set build/start commands
- [ ] Link database (auto-sets DATABASE_URL)
- [ ] Add other env variables (Cloudinary, etc.)
- [ ] Deploy

**Step 4 - Run Migrations:**
- [ ] From local machine, run migration scripts
- [ ] Point to RENDER_DATABASE_URL
- [ ] Verify tables created

**Step 5 - Deploy Frontend:**
- [ ] Create Static Site
- [ ] Connect to GitHub repo
- [ ] Set build command
- [ ] Set publish directory (dist/)
- [ ] Add VITE_API_URL env variable
- [ ] Deploy

**Step 6 - Test:**
- [ ] Visit frontend URL
- [ ] Test API calls
- [ ] Check browser console for errors
- [ ] Test all features

### Updating Deployment

**Backend Updates:**
1. Push changes to GitHub
2. Render auto-deploys (or manual deploy)
3. Check deploy logs for errors

**Frontend Updates:**
1. Push changes to GitHub
2. Render rebuilds and deploys
3. Clear browser cache to see changes

**Database Updates:**
1. Create migration script
2. Test locally
3. Run on Render database
4. Verify with check script

---

## Monitoring & Logs

### Viewing Logs

**Render Dashboard:**
1. Select service
2. Click "Logs" tab
3. Real-time logs appear

**Log Levels:**
- INFO: Normal operations
- WARN: Potential issues
- ERROR: Failures

**Useful logs:**
```javascript
// In backend code
console.log('[SERVER] Starting on port', PORT);
console.error('[ERROR]', error.message);
console.warn('[WARN] Missing config:', key);
```

### Health Checks

**Basic health endpoint:**

```javascript
// backend/server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: pool ? 'connected' : 'disconnected'
  });
});
```

**Visit:** `https://kkp-platform.onrender.com/health`

---

## Free Tier Limitations

**Render Free Plan:**

1. **Sleep after 15 minutes inactivity:**
   - Services spin down after 15 min
   - First request takes 30-60s (cold start)
   - Subsequent requests are fast

2. **750 hours/month per service:**
   - More than enough for development
   - Upgrade for 24/7 uptime

3. **Ephemeral filesystem:**
   - Files don't persist
   - Use Cloudinary for uploads

4. **Database:**
   - 90-day expiration (free tier)
   - 256 MB storage
   - Upgrade for production

**Optimization for Free Tier:**
- Use Cloudinary for files
- Accept cold starts
- Schedule important tasks during active hours
- Upgrade when ready for production

---

## Related Resources

- [Render Configuration Examples](resources/render-configuration.md)
- [Cloudinary Setup Guide](resources/cloudinary-setup.md)
- [Environment Variables Reference](resources/env-variables.md)
- [Deployment Checklist](resources/deployment-checklist.md)

---

*This skill auto-activates when working with Render deployment, Cloudinary integration, or production configuration.*
