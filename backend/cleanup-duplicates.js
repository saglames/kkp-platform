require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanupDuplicates() {
  try {
    console.log('🔍 Starting duplicate cleanup...\n');

    const tablesWithUrunId = [
      'surec_temizlemeye_gidecek',
      'surec_temizlemede_olan',
      'surec_temizlemeden_gelen',
      'surec_kalan'
    ];

    const tablesWithUrunKodu = [
      'surec_sevke_hazir'
    ];

    // urun_id olan tablolar
    for (const table of tablesWithUrunId) {
      console.log(`📋 Cleaning ${table}...`);

      const result = await renderPool.query(`
        DELETE FROM ${table}
        WHERE id NOT IN (
          SELECT MAX(id)
          FROM ${table}
          GROUP BY urun_id
        )
      `);

      console.log(`   ✅ Deleted ${result.rowCount} duplicate records\n`);
    }

    // urun_kodu_base olan tablolar
    for (const table of tablesWithUrunKodu) {
      console.log(`📋 Cleaning ${table}...`);

      const result = await renderPool.query(`
        DELETE FROM ${table}
        WHERE id NOT IN (
          SELECT MAX(id)
          FROM ${table}
          GROUP BY urun_kodu_base
        )
      `);

      console.log(`   ✅ Deleted ${result.rowCount} duplicate records\n`);
    }

    // UNIQUE constraint ekle
    console.log('🔧 Adding UNIQUE constraints...');
    for (const table of tablesWithUrunId) {
      try {
        await renderPool.query(`
          ALTER TABLE ${table}
          ADD CONSTRAINT ${table}_urun_id_key UNIQUE (urun_id)
        `);
        console.log(`   ✅ Added constraint to ${table}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`   ⚠️  Constraint already exists on ${table}`);
        } else {
          throw err;
        }
      }
    }

    for (const table of tablesWithUrunKodu) {
      try {
        await renderPool.query(`
          ALTER TABLE ${table}
          ADD CONSTRAINT ${table}_urun_kodu_base_key UNIQUE (urun_kodu_base)
        `);
        console.log(`   ✅ Added constraint to ${table}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`   ⚠️  Constraint already exists on ${table}`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ Cleanup completed successfully!');
    await renderPool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await renderPool.end();
    process.exit(1);
  }
}

cleanupDuplicates();
