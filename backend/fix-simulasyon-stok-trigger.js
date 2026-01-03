const pool = require('./db');

async function fixTrigger() {
  try {
    console.log('Simülasyon stok tablosu trigger düzeltiliyor...');

    // Simülasyon stok tablosundaki eski trigger'ı kaldır
    await pool.query(`
      DROP TRIGGER IF EXISTS update_simulasyon_stok_updated_at ON simulasyon_stok;
    `);

    console.log('✅ Simülasyon stok trigger kaldırıldı');

    // Simülasyon stok hareket log tablosundaki eski trigger'ı kaldır
    await pool.query(`
      DROP TRIGGER IF EXISTS update_simulasyon_stok_hareket_log_updated_at ON simulasyon_stok_hareket_log;
    `);

    console.log('✅ Simülasyon stok hareket log trigger kaldırıldı');

    console.log('✅ Tüm trigger\'lar başarıyla kaldırıldı!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

fixTrigger();
