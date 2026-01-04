require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Render database'ini kullan
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.RENDER_DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : undefined
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Temizleme Takip Sistemi - Database Migration Başlatılıyor...\n');

    // SQL dosyasını oku
    const sqlPath = path.join(__dirname, 'migrations', 'create-temizleme-takip-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Migration SQL dosyası okundu');
    console.log('📊 Tablolar oluşturuluyor...\n');

    // SQL'i çalıştır
    await client.query(sql);

    console.log('✅ Tablolar başarıyla oluşturuldu!\n');

    // Oluşturulan tabloları kontrol et
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('temizleme_sevkiyat', 'sevkiyat_urunler')
      ORDER BY table_name;
    `);

    console.log('📋 Oluşturulan Tablolar:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // View'i kontrol et
    const views = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name = 'v_sevkiyat_ozet';
    `);

    if (views.rows.length > 0) {
      console.log('\n📊 Oluşturulan View:');
      console.log('   ✓ v_sevkiyat_ozet');
    }

    // Tablo yapılarını göster
    console.log('\n📐 Tablo Yapıları:\n');

    // temizleme_sevkiyat
    const sevkiyatCols = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'temizleme_sevkiyat'
      ORDER BY ordinal_position;
    `);

    console.log('temizleme_sevkiyat:');
    sevkiyatCols.rows.forEach(col => {
      const type = col.character_maximum_length
        ? `${col.data_type}(${col.character_maximum_length})`
        : col.data_type;
      console.log(`   - ${col.column_name}: ${type}`);
    });

    // sevkiyat_urunler
    const urunlerCols = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'sevkiyat_urunler'
      ORDER BY ordinal_position;
    `);

    console.log('\nsevkiyat_urunler:');
    urunlerCols.rows.forEach(col => {
      const type = col.character_maximum_length
        ? `${col.data_type}(${col.character_maximum_length})`
        : col.data_type;
      console.log(`   - ${col.column_name}: ${type}`);
    });

    console.log('\n🎉 Migration başarıyla tamamlandı!');
    console.log('💡 Artık Temizleme Takip sistemi kullanıma hazır.\n');

  } catch (error) {
    console.error('❌ Migration hatası:', error.message);
    console.error('Detay:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
