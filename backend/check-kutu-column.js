const { Client } = require('pg');

async function checkColumn() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'kkp_db',
    password: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();

    // Kolon detaylarını kontrol et
    const columnInfo = await client.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'urun_recetesi' AND column_name = 'kutu_tipi'
    `);

    console.log('=== kutu_tipi KOLON DETAYI ===');
    if (columnInfo.rows.length > 0) {
      console.log(JSON.stringify(columnInfo.rows[0], null, 2));
    } else {
      console.log('❌ kutu_tipi kolonu bulunamadı!');
    }

    // Test INSERT
    console.log('\n=== TEST INSERT ===');
    const insertResult = await client.query(
      `INSERT INTO urun_recetesi (urun_kodu, urun_adi, aciklama, koli_tipi, koli_kapasitesi, kutu_tipi)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      ['TEST-DIRECT', 'Test Direct', '', 'B2', 10, 'K9']
    );

    console.log('✅ INSERT başarılı!');
    console.log('Eklenen kayıt:');
    console.log('  ID:', insertResult.rows[0].id);
    console.log('  Ürün Kodu:', insertResult.rows[0].urun_kodu);
    console.log('  Kutu Tipi:', insertResult.rows[0].kutu_tipi);

    await client.end();
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await client.end();
  }
}

checkColumn();
