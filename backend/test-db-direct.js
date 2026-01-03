const { Client } = require('pg');

async function test() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'kkp_db',
    password: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ Database bağlantısı başarılı\n');

    // Tablo yapısını kontrol et
    const columns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'urun_recetesi'
      ORDER BY ordinal_position
    `);

    console.log('=== urun_recetesi tablosundaki kolonlar ===');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Bir test update yapalım
    console.log('\n=== TEST UPDATE ===');
    const updateResult = await client.query(
      `UPDATE urun_recetesi SET kutu_tipi = $1 WHERE id = $2 RETURNING *`,
      ['K8', 10]
    );

    if (updateResult.rows.length > 0) {
      console.log('✅ Update başarılı!');
      console.log('Güncel veri:', {
        id: updateResult.rows[0].id,
        urun_kodu: updateResult.rows[0].urun_kodu,
        kutu_tipi: updateResult.rows[0].kutu_tipi
      });
    }

    await client.end();
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('Detay:', error);
    await client.end();
  }
}

test();
