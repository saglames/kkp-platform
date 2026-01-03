const pool = require('./db');

async function checkSchema() {
  try {
    console.log('=== DATABASE ŞEMA KONTROLÜ ===\n');

    // Tablo yapısını kontrol et
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'urun_recetesi'
      ORDER BY ordinal_position
    `);

    console.log('urun_recetesi tablosundaki kolonlar:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (NULL: ${col.is_nullable})`);
    });

    // Mevcut verileri kontrol et
    console.log('\n=== MEVCUT VERİLER ===\n');
    const data = await pool.query('SELECT id, urun_kodu, urun_adi, kutu_tipi, koli_tipi FROM urun_recetesi ORDER BY id');

    console.log('Tüm ürün reçeteleri:');
    data.rows.forEach(row => {
      console.log(`  ID: ${row.id} | Ürün: ${row.urun_kodu} | Kutu: ${row.kutu_tipi || 'NULL'} | Koli: ${row.koli_tipi || 'NULL'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Hata:', error.message);
    await pool.end();
  }
}

checkSchema();
