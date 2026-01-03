# Render Service Configuration Examples

## Backend Web Service

**Service Name:** kkp-platform
**Type:** Web Service
**Environment:** Node
**Region:** Frankfurt (or closest to database)

### Build Settings

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && node server.js
```

**Auto-Deploy:** Yes (when pushing to main branch)

### Environment Variables

```env
DATABASE_URL=<auto-set-by-render>
RENDER_DATABASE_URL=<same-as-DATABASE_URL>
CLOUDINARY_CLOUD_NAME=dq15rlo4k
CLOUDINARY_API_KEY=893469772259385
CLOUDINARY_API_SECRET=iOSE-BDrI6LHMB9A1f2TN7MMmfs
NODE_ENV=production
```

### Health Check Path

```
/health
```

---

## Frontend Static Site

**Service Name:** kkp-frontend
**Type:** Static Site
**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Publish Directory:**
```
frontend/dist
```

### Environment Variables

```env
VITE_API_URL=https://kkp-platform.onrender.com
```

---

## PostgreSQL Database

**Name:** kkp-db
**Database:** kkp_db
**Region:** Frankfurt
**Plan:** Free (or Starter for production)

### Connection Info

**Internal URL:** Auto-set as DATABASE_URL in linked services
**External URL:** Used for local migrations

**Format:**
```
postgresql://user:password@host/database
```

---

## render.yaml (Optional)

For infrastructure-as-code:

```yaml
databases:
  - name: kkp-db
    databaseName: kkp_db
    region: frankfurt
    plan: free

services:
  - type: web
    name: kkp-platform
    env: node
    region: frankfurt
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: kkp-db
          property: connectionString

  - type: web
    name: kkp-frontend
    env: static
    region: frankfurt
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://kkp-platform.onrender.com
```
