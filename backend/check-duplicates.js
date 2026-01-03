require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDuplicates() {
  try {
    // Temizlemeye gidecek tablosunda aynı urun_id'den birden fazla kayıt var mı?
    const result = await renderPool.query(`
      SELECT urun_id, COUNT(*) as count
      FROM surec_temizlemeye_gidecek
      GROUP BY urun_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

    console.log('Duplicate urun_id records in surec_temizlemeye_gidecek:');
    result.rows.forEach(row => {
      console.log(`  urun_id ${row.urun_id}: ${row.count} kayıt`);
    });

    // Bu kayıtların detaylarını göster
    if (result.rows.length > 0) {
      const urunId = result.rows[0].urun_id;
      const details = await renderPool.query(
        'SELECT * FROM surec_temizlemeye_gidecek WHERE urun_id = $1',
        [urunId]
      );
      console.log(`\nExample duplicates for urun_id ${urunId}:`);
      details.rows.forEach(row => {
        console.log(`  id: ${row.id}, adet: ${row.adet}, updated_at: ${row.updated_at}`);
      });
    }

    await renderPool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await renderPool.end();
  }
}

checkDuplicates();
