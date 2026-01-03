const pool = require('./db');

async function migrate() {
  try {
    console.log('Simülasyon stok hareket log tablosu oluşturuluyor...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS simulasyon_stok_hareket_log (
        id SERIAL PRIMARY KEY,
        stok_id INTEGER REFERENCES simulasyon_stok(id) ON DELETE CASCADE,
        islem_turu VARCHAR(20) NOT NULL, -- 'ekleme' veya 'kullanim'
        miktar INTEGER NOT NULL,
        onceki_stok INTEGER NOT NULL,
        yeni_stok INTEGER NOT NULL,
        yapan VARCHAR(100) NOT NULL,
        sebep TEXT,
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ simulasyon_stok_hareket_log tablosu başarıyla oluşturuldu!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
