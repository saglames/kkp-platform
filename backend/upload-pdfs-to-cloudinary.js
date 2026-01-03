require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Database pools
const localPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function uploadPDFsToCloudinary() {
  try {
    console.log('🔍 Fetching files from local database...');

    const filesResult = await localPool.query(
      'SELECT * FROM teknik_resimler_dosyalar ORDER BY id'
    );

    console.log(`Found ${filesResult.rows.length} files to upload\n`);

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const file of filesResult.rows) {
      try {
        console.log(`[${file.id}] Processing: ${file.dosya_adi}...`);

        // Check if file exists locally
        if (!fs.existsSync(file.dosya_yolu)) {
          console.log(`  ⚠️  File not found locally, skipping`);
          skippedCount++;
          continue;
        }

        // Extract category from path
        const pathParts = file.dosya_yolu.split(path.sep);
        const kategoriId = pathParts[pathParts.length - 2] || 'genel';

        // Create safe filename
        const safeName = file.dosya_adi
          .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U')
          .replace(/ş/g, 's').replace(/Ş/g, 'S')
          .replace(/ı/g, 'i').replace(/İ/g, 'I')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ç/g, 'c').replace(/Ç/g, 'C')
          .replace(/\s+/g, '-')
          .replace('.pdf', '');

        const timestamp = Date.now();
        const publicId = `teknik-resimler/${kategoriId}/${timestamp}-${safeName}`;

        // Upload to Cloudinary
        console.log(`  ⬆️  Uploading to Cloudinary...`);
        const uploadResult = await cloudinary.uploader.upload(file.dosya_yolu, {
          resource_type: 'raw',
          public_id: publicId,
          folder: `teknik-resimler/${kategoriId}`
        });

        console.log(`  ✅ Uploaded successfully`);
        console.log(`     Cloudinary URL: ${uploadResult.secure_url}`);

        // Update local database
        await localPool.query(
          'UPDATE teknik_resimler_dosyalar SET dosya_yolu = $1 WHERE id = $2',
          [uploadResult.secure_url, file.id]
        );

        // Update Render database
        await renderPool.query(
          'UPDATE teknik_resimler_dosyalar SET dosya_yolu = $1 WHERE id = $2',
          [uploadResult.secure_url, file.id]
        );

        console.log(`  ✅ Database updated\n`);
        uploadedCount++;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Upload Summary:');
    console.log(`   ✅ Uploaded: ${uploadedCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

    await localPool.end();
    await renderPool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Details:', error);
    await localPool.end();
    await renderPool.end();
    process.exit(1);
  }
}

uploadPDFsToCloudinary();
