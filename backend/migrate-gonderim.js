const pool = require('./db');

async function migrate() {
  try {
    console.log('Gönderim tablosu oluşturuluyor...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS siparis_gonderimler (
        id SERIAL PRIMARY KEY,
        siparis_id INTEGER REFERENCES siparis_hazirlik(id) ON DELETE CASCADE,
        gonderen VARCHAR(100) NOT NULL,
        gonderilen_adet INTEGER NOT NULL,
        gonderim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notlar TEXT
      )
    `);

    console.log('✅ siparis_gonderimler tablosu başarıyla oluşturuldu!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
