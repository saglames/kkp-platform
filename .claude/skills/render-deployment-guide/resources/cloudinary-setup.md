# Cloudinary Setup & Integration Guide

## Why Cloudinary for Render?

Render uses **ephemeral filesystem** - uploaded files disappear on:
- Service restart
- Redeployment
- Plan changes

**Solution:** Cloudinary provides persistent cloud storage.

---

## Setup Steps

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up (free tier: 25 GB storage, 25 GB bandwidth)
3. Verify email

### 2. Get Credentials

From Cloudinary Dashboard:

1. Click "Dashboard" in sidebar
2. Find "Account Details" section
3. Copy three values:
   - Cloud Name (e.g., `dq15rlo4k`)
   - API Key (e.g., `893469772259385`)
   - API Secret (click "reveal" to see)

### 3. Add to Render Environment

In Render backend service:

1. Go to "Environment" tab
2. Add three variables:
   ```
   CLOUDINARY_CLOUD_NAME=dq15rlo4k
   CLOUDINARY_API_KEY=893469772259385
   CLOUDINARY_API_SECRET=iOSE-BDrI6LHMB9A1f2TN7MMmfs
   ```
3. Save Changes

---

## Backend Integration

### Install Packages

```bash
cd backend
npm install cloudinary streamifier
```

### Configure

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

### Upload Function

```javascript
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, filename, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',  // For PDFs, docs, etc.
        public_id: `${folder}/${Date.now()}-${filename}`,
        folder: folder
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
```

### Usage in Route

```javascript
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'my-folder'
    );

    // Save result.secure_url to database
    await pool.query(`
      INSERT INTO files (name, url, size)
      VALUES ($1, $2, $3)
    `, [req.file.originalname, result.secure_url, req.file.size]);

    res.json({ url: result.secure_url });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

---

## Migrating Existing Files

If you have files already uploaded locally:

```javascript
const fs = require('fs');
const path = require('path');

async function migrateFiles() {
  const files = await pool.query('SELECT * FROM files');

  for (const file of files.rows) {
    try {
      // Upload local file to Cloudinary
      const result = await cloudinary.uploader.upload(file.local_path, {
        resource_type: 'raw',
        public_id: path.basename(file.local_path),
        folder: 'migrated-files'
      });

      // Update database with Cloudinary URL
      await pool.query(`
        UPDATE files SET url = $1 WHERE id = $2
      `, [result.secure_url, file.id]);

      console.log(`✅ Migrated: ${file.name}`);

    } catch (error) {
      console.error(`❌ Failed: ${file.name}`, error.message);
    }
  }

  console.log('Migration completed!');
}
```

---

## Frontend Integration

### Display Cloudinary Image/PDF

```javascript
// Direct URL (already accessible)
<img src={fileUrl} alt="File" />

// Or for PDFs
<iframe src={fileUrl} width="100%" height="600px" />
```

### Using PDF.js Viewer

For better PDF viewing:

```javascript
const pdfUrl = file.dosya_yolu;  // Cloudinary URL
const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

<iframe src={viewerUrl} width="100%" height="800px" />
```

---

## Best Practices

### 1. Organize with Folders

```javascript
// Good structure
cloudinary.uploader.upload(file, {
  folder: 'teknik-resimler/kategori-1'
});

// Avoid flat structure
cloudinary.uploader.upload(file, {
  public_id: 'random-file-123'  // ❌ Hard to manage
});
```

### 2. Use Descriptive Names

```javascript
const publicId = `${kategoriId}/${Date.now()}-${sanitizedFilename}`;
```

### 3. Handle Turkish Characters

```javascript
const sanitizeFilename = (name) => {
  return name
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
};
```

### 4. Delete Old Files

```javascript
// When deleting from database, also delete from Cloudinary
router.delete('/file/:id', async (req, res) => {
  const file = await pool.query('SELECT * FROM files WHERE id = $1', [req.params.id]);

  if (file.rows.length > 0) {
    // Extract public_id from URL
    const publicId = extractPublicId(file.rows[0].url);

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

    // Delete from database
    await pool.query('DELETE FROM files WHERE id = $1', [req.params.id]);
  }

  res.json({ success: true });
});

function extractPublicId(url) {
  // Extract public_id from Cloudinary URL
  const parts = url.split('/upload/');
  if (parts.length > 1) {
    return parts[1].split('.')[0];  // Remove extension
  }
  return null;
}
```

---

## Free Tier Limits

**Cloudinary Free Plan:**
- 25 GB storage
- 25 GB bandwidth/month
- 25 credits/month (transformations)
- Unlimited uploads

**For KKP Platform:**
- 22 PDFs uploaded (~50 MB total)
- Well within free limits
- Bandwidth depends on views/downloads

**Upgrade when:**
- Storage > 25 GB
- Bandwidth > 25 GB/month
- Need advanced transformations

---

## Troubleshooting

### Upload Fails

**Error:** `Invalid API credentials`
**Fix:** Check env variables are set correctly

**Error:** `File too large`
**Fix:** Cloudinary free tier allows up to 10 MB per file

### Files Not Displaying

**Error:** CORS issues
**Fix:** Cloudinary URLs work cross-origin by default

**Error:** 404 on file URL
**Fix:** Check file was actually uploaded (check Cloudinary dashboard)

### Migration Issues

**Error:** Local file path doesn't exist
**Fix:** Ensure files exist before migration, or skip missing files

---

## KKP Platform Example

From `backend/routes/teknikalResimler.js`:

```javascript
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/dosya-yukle', upload.single('dosya'), async (req, res) => {
  try {
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.body.kategori_id
    );

    await pool.query(`
      INSERT INTO teknik_resimler_dosyalar
      (kategori_id, dosya_adi, dosya_yolu, dosya_boyutu, yukleyen)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.body.kategori_id,
      req.file.originalname,
      result.secure_url,  // Cloudinary URL
      req.file.size,
      req.body.yukleyen
    ]);

    res.json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});
```

This pattern ensures all PDFs are stored in Cloudinary, not on Render's ephemeral filesystem.
