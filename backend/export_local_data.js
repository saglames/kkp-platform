// Export all data from local database to SQL file
const pool = require('./db');
const fs = require('fs').promises;

async function exportData() {
  try {
    console.log('Starting data export from local database...');

    const tables = [
      'mamul_izolasyon',
      'mamul_koli',
      'mamul_kutu',
      'mamul_tapa'
    ];

    let sqlOutput = '-- Real data export from local K.K.P. Platform database\n';
    sqlOutput += '-- Generated: ' + new Date().toISOString() + '\n\n';

    for (const table of tables) {
      console.log(`Exporting ${table}...`);
      const result = await pool.query(`SELECT * FROM ${table}`);
      console.log(`  Found ${result.rows.length} rows`);

      if (result.rows.length > 0) {
        sqlOutput += `-- ${table.toUpperCase()}\n`;

        for (const row of result.rows) {
          const columns = Object.keys(row).filter(col =>
            col !== 'id' && col !== 'created_at' && col !== 'updated_at'
          );

          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (Array.isArray(val)) return `ARRAY[${val.map(v => `'${v}'`).join(', ')}]`;
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return val;
          });

          sqlOutput += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
        }
        sqlOutput += '\n';
      }
    }

    await fs.writeFile('./real_data_export.sql', sqlOutput, 'utf8');
    console.log('\n✅ Export complete! File saved: real_data_export.sql');
    console.log('Total size:', (sqlOutput.length / 1024).toFixed(2), 'KB');

    process.exit(0);
  } catch (error) {
    console.error('Export error:', error);
    process.exit(1);
  }
}

exportData();
