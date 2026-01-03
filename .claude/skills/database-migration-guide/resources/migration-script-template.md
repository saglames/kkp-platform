# Migration Script Template

Use this template to create new migration scripts for KKP Platform.

## Basic Template

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate[TableName]() {
  const client = await renderPool.connect();

  try {
    console.log('Creating [table_name] table on Render...\n');

    await client.query('BEGIN');

    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = '[table_name]'
      )
    `);

    if (!tableExists.rows[0].exists) {
      // Create table
      await client.query(`
        CREATE TABLE [table_name] (
          id SERIAL PRIMARY KEY,
          -- Add your columns here
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ [table_name] table created');
    } else {
      console.log('✅ [table_name] table already exists');
    }

    await client.query('COMMIT');

    // Test the table
    const testQuery = await client.query('SELECT COUNT(*) FROM [table_name]');
    console.log(`   Records in table: ${testQuery.rows[0].count}`);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await renderPool.end();
  }
}

migrate[TableName]();
```

## Template with Column Addition

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addColumnToTable() {
  const client = await renderPool.connect();

  try {
    console.log('Adding [column_name] to [table_name]...\n');

    await client.query('BEGIN');

    // Check if column exists
    const hasColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '[table_name]' AND column_name = '[column_name]'
    `);

    if (hasColumn.rows.length === 0) {
      console.log('   Adding [column_name] column...');
      await client.query(`
        ALTER TABLE [table_name]
        ADD COLUMN [column_name] [DATA_TYPE] [DEFAULT_VALUE]
      `);
      console.log('   ✅ [column_name] column added');
    } else {
      console.log('   ✅ [column_name] column already exists');
    }

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await renderPool.end();
  }
}

addColumnToTable();
```

## Template with UNIQUE Constraint

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addUniqueConstraint() {
  const client = await renderPool.connect();

  try {
    console.log('Adding UNIQUE constraint to [table_name]...\n');

    await client.query('BEGIN');

    // First, clean up duplicates if any exist
    const duplicates = await client.query(`
      SELECT [column_name], COUNT(*)
      FROM [table_name]
      GROUP BY [column_name]
      HAVING COUNT(*) > 1
    `);

    if (duplicates.rows.length > 0) {
      console.log(`   Found ${duplicates.rows.length} duplicate [column_name] values`);
      console.log('   Cleaning up duplicates...');

      // Delete duplicates, keeping only MAX(id)
      const deleteResult = await client.query(`
        DELETE FROM [table_name]
        WHERE id NOT IN (
          SELECT MAX(id)
          FROM [table_name]
          GROUP BY [column_name]
        )
      `);

      console.log(`   ✅ Deleted ${deleteResult.rowCount} duplicate records`);
    }

    // Add UNIQUE constraint
    await client.query(`
      ALTER TABLE [table_name]
      ADD CONSTRAINT [table_name]_[column_name]_unique UNIQUE ([column_name])
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('   ✅ UNIQUE constraint already exists');
      } else {
        throw err;
      }
    });

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await renderPool.end();
  }
}

addUniqueConstraint();
```

## Template with Data Sync

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function syncData() {
  const renderClient = await renderPool.connect();
  const localClient = await localPool.connect();

  try {
    console.log('Syncing [table_name] from local to Render...\n');

    // Get data from local
    const localData = await localClient.query('SELECT * FROM [table_name]');
    console.log(`   Found ${localData.rows.length} records in local database`);

    await renderClient.query('BEGIN');

    // Delete existing data on Render
    await renderClient.query('DELETE FROM [table_name]');
    console.log('   Deleted existing Render data');

    // Insert all records
    let inserted = 0;
    for (const row of localData.rows) {
      await renderClient.query(`
        INSERT INTO [table_name] (column1, column2, column3)
        VALUES ($1, $2, $3)
      `, [row.column1, row.column2, row.column3]);
      inserted++;
    }

    console.log(`   ✅ Inserted ${inserted} records`);

    // Fix sequence
    await renderClient.query(`
      SELECT setval('[table_name]_id_seq', (SELECT MAX(id) FROM [table_name]))
    `);
    console.log('   ✅ Sequence updated');

    await renderClient.query('COMMIT');
    console.log('\n✅ Sync completed successfully!');

  } catch (error) {
    await renderClient.query('ROLLBACK');
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    renderClient.release();
    localClient.release();
    await renderPool.end();
    await localPool.end();
  }
}

syncData();
```

## Naming Convention

Save your migration script as:

- `backend/migrate-[feature]-render.js` - For schema changes
- `backend/sync-[table]-to-render.js` - For data synchronization
- `backend/cleanup-[issue].js` - For data cleanup
- `backend/check-[validation].js` - For verification

**Examples:**
- `backend/migrate-hatali-urunler-render.js`
- `backend/sync-recete-to-render.js`
- `backend/cleanup-duplicates.js`
- `backend/check-render-tables.js`

## Usage

1. Copy the appropriate template
2. Replace placeholders: `[table_name]`, `[column_name]`, `[DATA_TYPE]`
3. Test on local database first
4. Run on Render: `node backend/migrate-script.js`
5. Verify success with check script
