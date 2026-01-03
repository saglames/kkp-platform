// Export ALL data from local database to SQL file
const pool = require('./db');
const fs = require('fs').promises;

async function exportData() {
  try {
    console.log('Starting FULL data export from local database...\n');

    // Get all tables from database
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('users', 'urun_tanimlari')
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Found tables:', tables.join(', '), '\n');

    let sqlOutput = '-- FULL DATA EXPORT from local K.K.P. Platform database\n';
    sqlOutput += '-- Generated: ' + new Date().toISOString() + '\n';
    sqlOutput += '-- This file contains ALL data from ALL tables\n\n';

    let totalRows = 0;

    for (const table of tables) {
      console.log(`Exporting ${table}...`);
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
      console.log(`  Found ${result.rows.length} rows`);

      if (result.rows.length > 0) {
        totalRows += result.rows.length;
        sqlOutput += `-- ========================================\n`;
        sqlOutput += `-- ${table.toUpperCase()} (${result.rows.length} rows)\n`;
        sqlOutput += `-- ========================================\n`;

        for (const row of result.rows) {
          const columns = Object.keys(row).filter(col =>
            col !== 'id' && col !== 'created_at' && col !== 'updated_at'
          );

          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (Array.isArray(val)) {
              const arrayValues = val.map(v => {
                if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
                return v;
              });
              return `ARRAY[${arrayValues.join(', ')}]`;
            }
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });

          sqlOutput += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlOutput += '\n';
      }
    }

    await fs.writeFile('./real_data_export.sql', sqlOutput, 'utf8');
    console.log('\n✅ FULL Export complete!');
    console.log('📊 Total tables:', tables.length);
    console.log('📊 Total rows:', totalRows);
    console.log('📄 File: real_data_export.sql');
    console.log('💾 Size:', (sqlOutput.length / 1024).toFixed(2), 'KB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Export error:', error);
    process.exit(1);
  }
}

exportData();
