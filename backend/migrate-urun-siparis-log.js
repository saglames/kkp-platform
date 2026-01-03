const pool = require('./db');

async function migrate() {
  try {
    console.log('Ürün sipariş değişiklik log tablosu oluşturuluyor...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS urun_siparis_degisiklik_log (
        id SERIAL PRIMARY KEY,
        siparis_id INTEGER REFERENCES urun_siparisler(id) ON DELETE CASCADE,
        degistiren VARCHAR(100),
        degisiklik_turu VARCHAR(50) NOT NULL,
        eski_deger TEXT,
        yeni_deger TEXT,
        aciklama TEXT,
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ urun_siparis_degisiklik_log tablosu başarıyla oluşturuldu!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
