const pool = require('./db');

async function migrate() {
  try {
    console.log('Görevler tablosuna başlama ve bitiş tarihi sütunları ekleniyor...');

    // Başlama tarihi sütunu ekle
    await pool.query(`
      ALTER TABLE gorevler
      ADD COLUMN IF NOT EXISTS baslama_tarihi DATE
    `);

    // Bitiş tarihi sütunu ekle
    await pool.query(`
      ALTER TABLE gorevler
      ADD COLUMN IF NOT EXISTS bitis_tarihi DATE
    `);

    console.log('✅ Görevler tablosuna başlama ve bitiş tarihi sütunları başarıyla eklendi!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
