# K.K.P. Platform - Deployment & Production Fixes Plan

## Project Overview
K.K.P. Platform is a full-stack web application for managing manufacturing processes (product recipes, quality control, technical drawings, and process management). The application is deployed on Render with PostgreSQL database and Cloudinary for file storage.

## Current Status

### ✅ Completed Issues
1. **Order Calculation Feature** - Fixed missing `siparis_hesaplama_kayitlari` table
2. **Recipe Data Sync** - Uploaded 12 recipes and 77 materials to Render
3. **Technical Drawings Authentication** - Created missing tables for login system
4. **PDF Storage & Viewing** - Integrated Cloudinary + Mozilla PDF.js viewer
5. **Shipment Add Button** - Fixed column name mismatch in `siparis_degisiklik_log`
6. **Simulation Stock Buttons** - Created missing `simulasyon_stok_hareket_log` table
7. **Faulty Products Update** - Created `hatali_urunler` tables
8. **Duplicate Products** - Cleaned 173 duplicates from `surec_temizlemeye_gidecek`, 28 from `surec_sevke_hazir`
9. **Anasayfa Not Showing** - Created `surec_anasayfa` view with proper schema fixes

### 📊 Production Health Check
- **Backend URL:** https://kkp-platform.onrender.com
- **Frontend URL:** https://kkp-frontend.onrender.com
- **Database:** Render PostgreSQL
- **File Storage:** Cloudinary
- **All Critical Tables:** ✅ Created and populated
- **Duplicate Prevention:** ✅ UNIQUE constraints added

## Architecture

### Backend Stack
- Node.js + Express.js
- PostgreSQL database (Render hosted)
- Cloudinary for PDF file storage
- JWT authentication for technical drawings section

### Frontend Stack
- React with Vite
- TailwindCSS for styling
- Axios for API calls
- PDF.js for PDF viewing

### Key Database Tables
```
├── Product Management
│   ├── urun_recetesi (product recipes)
│   ├── recete_malzemeler (recipe materials)
│   └── siparis_hesaplama_kayitlari (order calculations)
│
├── Quality Control
│   ├── kalite_kontrol_siparisler (orders)
│   ├── siparis_gonderimler (shipments)
│   ├── siparis_degisiklik_log (change log)
│   ├── simulasyon_stok_hareket_log (stock movements)
│   └── hatali_urunler (faulty products)
│
├── Technical Drawings
│   ├── teknik_resimler_kategoriler (categories)
│   ├── teknik_resimler_dosyalar (PDF files)
│   └── teknik_resimler_login_log (login attempts)
│
└── Process Management (Tüm Süreç)
    ├── surec_urunler (products master)
    ├── surec_temizlemeye_gidecek (to be cleaned)
    ├── surec_temizlemede_olan (being cleaned)
    ├── surec_temizlemeden_gelen (cleaned)
    ├── surec_sevke_hazir (ready to ship)
    ├── surec_sevk_edilen (shipped)
    ├── surec_kalan (remaining)
    ├── surec_hareket_log (movement log)
    └── surec_anasayfa (VIEW - homepage summary)
```

## Migration Scripts Created

### Database Migrations
1. `migrate-render.js` - Created siparis_hesaplama_kayitlari table
2. `sync-recete-to-render.js` - Synced recipe data (12 recipes, 77 materials)
3. `migrate-teknik-resimler.js` - Created technical drawings tables
4. `upload-pdfs-to-cloudinary.js` - Uploaded 22 PDFs to Cloudinary
5. `migrate-simulasyon-stok-log.js` - Created stock movement log table
6. `migrate-hatali-urunler-render.js` - Created faulty products tables
7. `cleanup-duplicates.js` - Removed duplicate records + added UNIQUE constraints
8. `migrate-surec-schema.js` - Fixed schema + created anasayfa view

### Utility Scripts
1. `check-anasayfa-view.js` - Verify anasayfa view exists
2. `check-render-tables.js` - List all surec tables and record counts
3. `check-column-names.js` - Inspect table column structures
4. `check-duplicates-production.js` - Verify no duplicates remain

## Code Changes Summary

### Backend Changes

#### 1. Environment Configuration
**File:** `backend/.env`
```env
CLOUDINARY_CLOUD_NAME=dq15rlo4k
CLOUDINARY_API_KEY=893469772259385
CLOUDINARY_API_SECRET=iOSE-BDrI6LHMB9A1f2TN7MMmfs
RENDER_DATABASE_URL=postgresql://kkp_db_user:...
```

#### 2. Technical Drawings API Rewrite
**File:** `backend/routes/teknikalResimler.js`
- **Before:** Used local filesystem (ephemeral on Render)
- **After:** Integrated Cloudinary for persistent storage
- **Key Functions:**
  - `uploadToCloudinary()` - Streams file buffer to Cloudinary
  - PDF files stored in `teknik-resimler/{kategoriId}` folder
  - Returns Cloudinary URL for direct access

#### 3. Quality Control Fix
**File:** `backend/routes/kaliteKontrol.js:309`
- **Before:** `INSERT INTO siparis_degisiklik_log (..., alan_adi, ...)`
- **After:** `INSERT INTO siparis_degisiklik_log (..., degisiklik_turu, ...)`
- **Reason:** Column name mismatch causing shipment add failures

#### 4. Process Management Routes
**File:** `backend/routes/tumSurec.js` (916 lines)
- **Endpoints:** All CRUD operations for process management
- **Key Features:**
  - Auto-creates products in `surec_urunler` if not exists
  - ON CONFLICT for upserts
  - Transaction support with BEGIN/COMMIT/ROLLBACK
  - Movement logging in `surec_hareket_log`

### Frontend Changes

#### 1. PDF Viewer Integration
**File:** `frontend/src/components/TeknikResimler/FileManager.jsx`
```javascript
// Uses Mozilla PDF.js viewer for cross-origin PDFs
const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(dosya.dosya_yolu)}`;
```

#### 2. Process Management Components
**Files:**
- `frontend/src/components/TumSurec/Anasayfa.jsx` - Dashboard view
- `frontend/src/components/TumSurec/TemizlemeyeGidecek.jsx` - To be cleaned
- `frontend/src/components/TumSurec/TemizlemedOlan.jsx` - Being cleaned
- `frontend/src/components/TumSurec/TemizlemedenGelen.jsx` - Cleaned items
- `frontend/src/components/TumSurec/SevkeHazir.jsx` - Ready to ship
- `frontend/src/components/TumSurec/SevkEdilen.jsx` - Shipped items
- `frontend/src/components/TumSurec/Kalan.jsx` - Remaining items
- `frontend/src/components/TumSurec/HareketLog.jsx` - Movement history

**Common Features:**
- "Yeni Ekle" (Add New) button with modal
- Edit/Delete operations
- Transfer between stages
- Real-time updates after operations

## Known Issues & Solutions

### Issue: Ephemeral Filesystem on Render
**Problem:** Render's free tier has ephemeral filesystem - uploaded files disappear on restart
**Solution:** Migrated to Cloudinary for persistent file storage
**Status:** ✅ Resolved

### Issue: Schema Mismatch Between Local & Production
**Problem:** Render database had different column structure than local
**Example:** `surec_temizlemede_olan` was missing `adet` column
**Solution:** Created migration scripts to align schemas
**Status:** ✅ Resolved

### Issue: Duplicate Records
**Problem:** Multiple records with same `urun_id` in process tables
**Root Cause:** Migration or data import created duplicates
**Solution:**
1. Deleted duplicates keeping only MAX(id) per urun_id
2. Added UNIQUE constraints to prevent recurrence
**Status:** ✅ Resolved (173 + 28 records cleaned)

### Issue: Missing Database Views
**Problem:** `surec_anasayfa` view didn't exist on Render
**Impact:** Anasayfa (homepage) showed no data
**Solution:** Created view with proper LEFT JOINs across all surec tables
**Status:** ✅ Resolved

## Data Flow Diagrams

### Process Management Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCT LIFECYCLE                           │
└─────────────────────────────────────────────────────────────────┘

1. Product Creation
   └─> surec_urunler (urun_id assigned)

2. To Be Cleaned Stage
   └─> surec_temizlemeye_gidecek (urun_id, adet)
       │
       └─> [Temizlemeye Gönder] → surec_hareket_log

3. Being Cleaned Stage
   └─> surec_temizlemede_olan (urun_id, adet)
       │
       └─> [Temizlemeden Getir] → surec_hareket_log

4. Cleaned Stage
   └─> surec_temizlemeden_gelen (urun_id, adet)
       │
       └─> [Sevke Hazırla] → surec_hareket_log
           (combines A + B parts by urun_kodu_base)

5. Ready to Ship
   └─> surec_sevke_hazir (urun_kodu_base, adet)
       │
       └─> [Sevk Et] → surec_hareket_log

6. Shipped
   └─> surec_sevk_edilen (permanent record with shipment details)

7. Remaining/Defective
   └─> surec_kalan (urun_id, adet, notlar, tapali_bekleyen_notlar)
```

### Anasayfa View Aggregation
```sql
SELECT
    u.urun_kodu,
    COALESCE(tg.adet, 0) as temizlemeye_gidecek,
    COALESCE(to2.adet, 0) as temizlemede_olan,
    COALESCE(tgelen.adet, 0) as temizlemeden_gelen,
    COALESCE(sh.adet, 0) as sevke_hazir,
    COALESCE(k.adet, 0) as kalan,
    SUM(se.adet) as sevk_edilen_toplam
FROM surec_urunler u
LEFT JOIN surec_temizlemeye_gidecek tg ON u.id = tg.urun_id
LEFT JOIN surec_temizlemede_olan to2 ON u.id = to2.urun_id
LEFT JOIN surec_temizlemeden_gelen tgelen ON u.id = tgelen.urun_id
LEFT JOIN surec_sevke_hazir sh ON u.urun_kodu_base = sh.urun_kodu_base
LEFT JOIN surec_kalan k ON u.id = k.urun_id
LEFT JOIN surec_sevk_edilen se ON u.urun_kodu_base = se.urun_kodu_base
```

## Testing Checklist

### ✅ Completed Tests

#### Order Calculation
- [x] Product selection dropdown loads recipes
- [x] Quantity input triggers calculation
- [x] Results saved to `siparis_hesaplama_kayitlari`
- [x] Production URL: https://kkp-frontend.onrender.com/urun-recetesi

#### Recipe Management
- [x] All recipes visible (12 total)
- [x] Materials list loads for each recipe (77 total materials)
- [x] Data synced from local to Render

#### Technical Drawings
- [x] Login works (username: esatakg, password: esatakgsistemi)
- [x] PDF upload to Cloudinary successful
- [x] PDF viewing via Mozilla PDF.js viewer
- [x] 22 existing PDFs migrated to Cloudinary

#### Quality Control
- [x] Shipment preparation - "Gönderim Ekle" button works
- [x] Simulation stock - "Stok Ekle", "Stok Kullan", "Hareket" buttons work
- [x] Faulty products - Update functionality works

#### Process Management (Tüm Süreç)
- [x] Anasayfa shows all products with aggregated counts (26 products)
- [x] No duplicate products in any stage
- [x] "Yeni Ekle" buttons functional in all tabs:
  - [x] Temizlemeye Gidecek
  - [x] Temizlemede Olan
  - [x] Temizlemeden Gelen
  - [x] Sevke Hazır
  - [x] Kalan

## Deployment Configuration

### Render Backend Service
```yaml
Name: kkp-platform
Type: Web Service
Environment: Node
Build Command: cd backend && npm install
Start Command: cd backend && node server.js
Environment Variables:
  - DATABASE_URL (auto from PostgreSQL)
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - RENDER_DATABASE_URL
```

### Render Frontend Service
```yaml
Name: kkp-frontend
Type: Static Site
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
Environment Variables:
  - VITE_API_URL=https://kkp-platform.onrender.com
```

### Render PostgreSQL Database
```yaml
Name: kkp-db
Region: Frankfurt
Plan: Free
Connection String: postgresql://kkp_db_user:***@dpg-***-a.frankfurt-postgres.render.com/kkp_db
```

## Future Maintenance Tasks

### 1. Schema Synchronization
**Priority:** High
**Action:** Keep local schema in sync with production
**Scripts to Run:**
- Always test migrations locally first
- Use transaction-based migrations (BEGIN/COMMIT/ROLLBACK)
- Backup production data before major schema changes

### 2. Duplicate Prevention
**Priority:** High
**Status:** ✅ UNIQUE constraints added
**Verify:**
```bash
node backend/check-duplicates-production.js
```

### 3. Data Backup Strategy
**Priority:** Medium
**Recommendation:**
- Export production data weekly
- Use `pg_dump` for full database backups
- Store backups in separate location (not on Render)

### 4. Performance Optimization
**Priority:** Low
**Considerations:**
- Add indexes on frequently queried columns
- Current indexes:
  - `idx_surec_urunler_base` on urun_kodu_base
  - `idx_surec_sevk_tarih` on sevk_edilen.tarih
  - `idx_surec_hareket_tarih` on hareket_log.created_at
  - `idx_surec_hareket_urun` on hareket_log.urun_id

### 5. Cloudinary Cleanup
**Priority:** Low
**Action:** Periodically remove orphaned PDFs from Cloudinary
**Note:** Check if PDF still referenced in `teknik_resimler_dosyalar` table

## Git Commit History

Recent commits show progression of fixes:
```
7590751 Fix siparis_degisiklik_log column name from alan_adi to degisiklik_turu
a241b61 Switch to Mozilla PDF.js viewer for better PDF display
c4fb0fe Use Google Docs Viewer for PDF display in modal
232d078 Fix PDF viewing - open in new tab instead of iframe
9fad748 Integrate Cloudinary for PDF file storage
```

## Success Metrics

### Production Health
- ✅ All critical features working on production
- ✅ Zero duplicate records in process tables
- ✅ All database tables and views created
- ✅ File storage migrated to persistent solution (Cloudinary)
- ✅ 26 products tracked across 8 process stages
- ✅ 22 technical drawing PDFs accessible

### Data Integrity
- ✅ Recipe data: 12 recipes with 77 materials
- ✅ Process data: 25 active records in temizlemeye_gidecek
- ✅ Shipment history: 25 records in sevk_edilen
- ✅ Movement logs: 170 records tracked

## Troubleshooting Guide

### Issue: "relation does not exist" error
**Diagnosis:** Table/view not created on Render
**Solution:**
1. Check if table exists: `node backend/check-render-tables.js`
2. Create missing table using appropriate migration script
3. Verify with curl test: `curl https://kkp-platform.onrender.com/api/[endpoint]`

### Issue: "column does not exist" error
**Diagnosis:** Schema mismatch between local and production
**Solution:**
1. Check column structure: `node backend/check-column-names.js`
2. Add missing column with ALTER TABLE
3. Update view definitions if needed

### Issue: Duplicate records appearing
**Diagnosis:** UNIQUE constraint missing or violated
**Solution:**
1. Check for duplicates: `node backend/check-duplicates-production.js`
2. Clean duplicates: Use cleanup-duplicates.js pattern
3. Add UNIQUE constraint to prevent recurrence

### Issue: PDF files not accessible
**Diagnosis:** Files stored locally instead of Cloudinary
**Solution:**
1. Verify Cloudinary credentials in .env
2. Re-upload files: `node backend/upload-pdfs-to-cloudinary.js`
3. Update database records with new Cloudinary URLs

## Contact & Support

**Developer:** Claude (Anthropic AI)
**User:** ESAT
**Project Location:** `c:\Users\ESAT\kkp-platform`
**Last Updated:** 2026-01-04

---

## Notes
- All migration scripts include proper error handling with try/catch
- Database operations use transactions for data integrity
- Render's free tier has limitations (ephemeral filesystem, sleep after inactivity)
- Always test locally before deploying to production
- Keep .env file secure and never commit to git
