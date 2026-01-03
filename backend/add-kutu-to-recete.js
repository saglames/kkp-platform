const pool = require('./db');

async function addKutuColumn() {
  try {
    console.log('Ürün reçetesi tablosuna kutu_tipi kolonu ekleniyor...');

    // kutu_tipi kolonunu ekle
    await pool.query(`
      ALTER TABLE urun_recetesi
      ADD COLUMN IF NOT EXISTS kutu_tipi VARCHAR(50)
    `);

    console.log('✅ kutu_tipi kolonu eklendi');

    console.log('\n✅ Tüm değişiklikler başarıyla tamamlandı!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addKutuColumn();
