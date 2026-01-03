// Clean duplicate records from local database
const pool = require('./db');

async function cleanDuplicates() {
  try {
    console.log('Starting duplicate cleanup...\n');

    const tables = [
      'mamul_izolasyon',
      'mamul_koli',
      'mamul_kutu',
      'mamul_tapa'
    ];

    for (const table of tables) {
      console.log(`Cleaning ${table}...`);

      // Delete duplicates, keeping only the row with the highest ID for each name
      const result = await pool.query(`
        DELETE FROM ${table}
        WHERE id NOT IN (
          SELECT MAX(id)
          FROM ${table}
          GROUP BY name
        )
      `);

      console.log(`  Deleted ${result.rowCount} duplicate rows\n`);
    }

    console.log('✅ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanDuplicates();
