const pool = require('./db');

async function fixTrigger() {
  try {
    console.log('Gönderim tablosu trigger düzeltiliyor...');

    // Eski trigger'ı kaldır
    await pool.query(`
      DROP TRIGGER IF EXISTS update_siparis_gonderimler_updated_at ON siparis_gonderimler;
    `);

    console.log('✅ Eski trigger kaldırıldı');

    // Yeni trigger oluştur (son_guncelleme için)
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_siparis_gonderimler_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.gonderim_tarihi = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ Yeni trigger fonksiyonu oluşturuldu');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

fixTrigger();
