// Export the actual schema from local PostgreSQL
const pool = require('./db');
const fs = require('fs').promises;

async function exportSchema() {
  try {
    console.log('Exporting local database schema...\n');

    // Get all table definitions
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    let schemaSQL = '-- K.K.P. Platform - Actual Local Database Schema\n';
    schemaSQL += '-- Exported: ' + new Date().toISOString() + '\n\n';

    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      console.log(`Exporting table: ${tableName}`);

      // Get table structure using pg_dump-like query
      const tableDefResult = await pool.query(`
        SELECT
          'CREATE TABLE ' || quote_ident(table_name) || ' (' ||
          string_agg(
            quote_ident(column_name) || ' ' ||
            CASE
              WHEN data_type = 'ARRAY' THEN udt_name || '[]'
              WHEN data_type = 'USER-DEFINED' THEN udt_name
              ELSE data_type
            END ||
            CASE
              WHEN character_maximum_length IS NOT NULL
              THEN '(' || character_maximum_length || ')'
              ELSE ''
            END ||
            CASE
              WHEN column_default IS NOT NULL
              THEN ' DEFAULT ' || column_default
              ELSE ''
            END ||
            CASE
              WHEN is_nullable = 'NO' THEN ' NOT NULL'
              ELSE ''
            END,
            ', '
          ) || ');' as create_statement
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        GROUP BY table_name
      `, [tableName]);

      if (tableDefResult.rows.length > 0) {
        schemaSQL += tableDefResult.rows[0].create_statement + '\n\n';
      }
    }

    await fs.writeFile('./actual_local_schema.sql', schemaSQL, 'utf8');
    console.log('\n✅ Schema exported to: actual_local_schema.sql');

    process.exit(0);
  } catch (error) {
    console.error('❌ Export error:', error);
    process.exit(1);
  }
}

exportSchema();
