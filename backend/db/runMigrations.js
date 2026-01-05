const pool = require('./index');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    const migrationFile = path.join(__dirname, '../migrations/add-kg-to-temizlemeden-gelen.sql');

    if (fs.existsSync(migrationFile)) {
      console.log('🔄 Running database migration...');
      const sql = fs.readFileSync(migrationFile, 'utf8');
      await pool.query(sql);
      console.log('✅ Migration completed: add-kg-to-temizlemeden-gelen');
    } else {
      console.log('ℹ️  No migration file found (this is OK if already migrated)');
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't crash the server, just log the error
    console.log('⚠️  Server will continue, but database may have issues');
  }
}

module.exports = runMigrations;
