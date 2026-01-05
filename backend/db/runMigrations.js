const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const migrations = [
    'add-kg-to-temizlemeden-gelen.sql',
    'add-problemli-columns.sql'
  ];

  try {
    console.log('🔄 Running database migrations...');

    for (const migrationName of migrations) {
      const migrationFile = path.join(__dirname, '../migrations', migrationName);

      if (fs.existsSync(migrationFile)) {
        console.log(`  ➜ Running: ${migrationName}`);
        const sql = fs.readFileSync(migrationFile, 'utf8');
        await pool.query(sql);
        console.log(`  ✅ Completed: ${migrationName}`);
      }
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't crash the server, just log the error
    console.log('⚠️  Server will continue, but database may have issues');
  }
}

module.exports = runMigrations;
