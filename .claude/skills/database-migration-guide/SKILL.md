# Database Migration Guide - Render PostgreSQL

> **Skill Type:** Domain Knowledge
> **For:** KKP Platform database migrations to Render PostgreSQL
> **Auto-activates when:** Working with migrations, database schema, or Render deployment

---

## What This Skill Provides

This skill guides you through creating and running database migrations for the KKP Platform, specifically targeting Render PostgreSQL deployment. It covers schema synchronization, duplicate prevention, and production-safe migration patterns.

---

## Core Patterns

### 1. Render PostgreSQL Connection

Always use SSL connection with `rejectUnauthorized: false` for Render:

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

**Environment Variable:**
```env
RENDER_DATABASE_URL=postgresql://kkp_db_user:password@dpg-xxx.frankfurt-postgres.render.com/kkp_db
```

### 2. Migration Script Structure

Based on existing KKP Platform migrations (`migrate-surec-schema.js`, `cleanup-duplicates.js`):

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await renderPool.connect();

  try {
    console.log('Starting migration...\n');

    await client.query('BEGIN');

    // Your migration logic here
    await client.query(`
      CREATE TABLE IF NOT EXISTS table_name (
        id SERIAL PRIMARY KEY,
        column1 VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await renderPool.end();
  }
}

migrate();
```

**Key Points:**
- Use transactions (BEGIN/COMMIT/ROLLBACK)
- Release client connection in finally block
- Exit with code 1 on failure for CI/CD detection
- Log success/failure clearly with emojis

### 3. Schema Alignment Patterns

**Problem:** Local database schema differs from Render
**Solution:** ALTER TABLE to add missing columns

**Example from `migrate-surec-schema.js`:**

```javascript
// Check if column exists first
const hasColumn = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'surec_temizlemede_olan' AND column_name = 'adet'
`);

if (hasColumn.rows.length === 0) {
  console.log('Adding adet column...');
  await client.query(`
    ALTER TABLE surec_temizlemede_olan
    ADD COLUMN adet INTEGER DEFAULT 0
  `);
  console.log('✅ adet column added');
} else {
  console.log('✅ adet column already exists');
}
```

**Pattern:** Check before adding to make migrations idempotent

### 4. Creating VIEWs

**Example from `migrate-surec-schema.js`:**

```javascript
await client.query(`
  CREATE OR REPLACE VIEW surec_anasayfa AS
  SELECT
      u.id,
      u.tip,
      u.urun_kodu,
      COALESCE(tg.adet, 0) as temizlemeye_gidecek,
      COALESCE(to2.adet, 0) as temizlemede_olan
  FROM surec_urunler u
  LEFT JOIN surec_temizlemeye_gidecek tg ON u.id = tg.urun_id
  LEFT JOIN surec_temizlemede_olan to2 ON u.id = to2.urun_id
  WHERE u.aktif = TRUE
  ORDER BY u.urun_kodu
`);
```

**Key Points:**
- Use `CREATE OR REPLACE` to make idempotent
- Use `COALESCE` for NULL handling
- Use LEFT JOIN to include all records

### 5. Duplicate Cleanup

**Example from `cleanup-duplicates.js`:**

```javascript
const tables = [
  'surec_temizlemeye_gidecek',
  'surec_temizlemede_olan',
  'surec_temizlemeden_gelen'
];

for (const table of tables) {
  // Delete duplicates, keeping only MAX(id) per urun_id
  const deleteResult = await client.query(`
    DELETE FROM ${table}
    WHERE id NOT IN (
      SELECT MAX(id)
      FROM ${table}
      GROUP BY urun_id
    )
  `);

  console.log(`Deleted ${deleteResult.rowCount} duplicates from ${table}`);

  // Add UNIQUE constraint to prevent future duplicates
  await client.query(`
    ALTER TABLE ${table}
    ADD CONSTRAINT ${table}_urun_id_unique UNIQUE (urun_id)
    ON CONFLICT DO NOTHING
  `);
}
```

**Pattern:**
1. Delete duplicates first (keep MAX(id))
2. Add UNIQUE constraint after cleanup
3. Use `ON CONFLICT DO NOTHING` to ignore if constraint exists

### 6. Data Synchronization

**Example from `sync-recete-to-render.js`:**

```javascript
// Get data from local database
const localPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const recipes = await localPool.query('SELECT * FROM urun_recetesi');

// Delete existing data on Render
await renderClient.query('DELETE FROM urun_recetesi');

// Insert all records
for (const recipe of recipes.rows) {
  await renderClient.query(`
    INSERT INTO urun_recetesi (urun_adi, urun_kodu, recete)
    VALUES ($1, $2, $3)
  `, [recipe.urun_adi, recipe.urun_kodu, recipe.recete]);
}

// Fix sequence after manual inserts
await renderClient.query(`
  SELECT setval('urun_recetesi_id_seq', (SELECT MAX(id) FROM urun_recetesi))
`);
```

**Pattern:**
1. Query local database
2. Delete existing data on Render (to avoid duplicates)
3. Insert all records
4. Fix sequence to prevent ID conflicts

---

## Common Migration Tasks

### Creating a New Table

```javascript
await client.query(`
  CREATE TABLE IF NOT EXISTS table_name (
    id SERIAL PRIMARY KEY,
    urun_id INTEGER REFERENCES surec_urunler(id) ON DELETE CASCADE,
    adet INTEGER DEFAULT 0,
    notlar TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    UNIQUE(urun_id)
  )
`);
```

### Adding an Index

```javascript
await client.query(`
  CREATE INDEX IF NOT EXISTS idx_table_column
  ON table_name(column_name)
`);
```

### Adding a Foreign Key

```javascript
await client.query(`
  ALTER TABLE child_table
  ADD CONSTRAINT fk_parent
  FOREIGN KEY (parent_id) REFERENCES parent_table(id)
  ON DELETE CASCADE
`);
```

---

## Testing Checklist

Before running migration on Render:

1. **Test locally first:**
   ```bash
   node backend/migrate-script.js
   ```

2. **Verify on local database:**
   ```bash
   psql -U postgres -d kkp_platform -c "\dt"  # List tables
   psql -U postgres -d kkp_platform -c "\d table_name"  # Describe table
   ```

3. **Check for syntax errors:**
   - Run migration in local PostgreSQL
   - Verify no errors in console

4. **Backup production data (if modifying existing tables):**
   - Export production data before migration
   - Or test on Render dev environment first

5. **Run migration on Render:**
   ```bash
   node backend/migrate-script.js
   ```

6. **Verify migration success:**
   - Check console output for "✅"
   - Query Render database to confirm changes
   - Test affected API endpoints

---

## Error Handling

### Common Errors

**Error:** `relation "table_name" already exists`
**Fix:** Use `CREATE TABLE IF NOT EXISTS` or `CREATE OR REPLACE VIEW`

**Error:** `column "column_name" already exists`
**Fix:** Check if column exists before adding (see Schema Alignment pattern)

**Error:** `duplicate key value violates unique constraint`
**Fix:** Clean up duplicates before adding UNIQUE constraint

**Error:** `SSL connection required`
**Fix:** Add `ssl: { rejectUnauthorized: false }` to Pool config

**Error:** `connection timeout`
**Fix:** Check RENDER_DATABASE_URL is correct and database is online

---

## Rollback Strategy

If migration fails:

1. **Transaction rollback (automatic):**
   - Migrations use BEGIN/COMMIT
   - On error, ROLLBACK happens automatically
   - No changes persist if error occurs

2. **Manual rollback:**
   ```javascript
   await client.query('DROP TABLE IF EXISTS new_table');
   await client.query('ALTER TABLE table_name DROP COLUMN new_column');
   ```

3. **Restore from backup:**
   - If data was deleted, restore from pg_dump
   - Always backup before destructive operations

---

## File Naming Conventions

Follow KKP Platform naming:

- `migrate-*.js` - Schema changes (create tables, add columns)
- `sync-*.js` - Data synchronization from local to Render
- `cleanup-*.js` - Data cleanup (remove duplicates, fix inconsistencies)
- `check-*.js` - Verification scripts (check if tables exist, count records)

**Examples:**
- `migrate-hatali-urunler-render.js`
- `sync-recete-to-render.js`
- `cleanup-duplicates.js`
- `check-render-tables.js`

---

## When to Use This Skill

✅ **Use when:**
- Creating new tables on Render
- Adding columns to existing tables
- Creating or updating database VIEWs
- Syncing data from local to production
- Cleaning up duplicate records
- Adding UNIQUE constraints
- Fixing schema mismatches

❌ **Don't use when:**
- Making application code changes (use backend-dev-guidelines instead)
- Frontend changes (use frontend-dev-guidelines instead)
- Simple SELECT queries (no migration needed)

---

## Related Resources

- [Migration Script Template](resources/migration-script-template.md)
- [Render Connection Patterns](resources/render-connection-patterns.md)
- [Common Issues & Solutions](resources/common-issues.md)
- [Testing Checklist](resources/testing-checklist.md)

---

## Integration with KKP Platform

**Existing Migration Scripts:**
- `backend/migrate-render.js` - siparis_hesaplama_kayitlari table
- `backend/migrate-teknik-resimler.js` - teknik_resimler tables
- `backend/migrate-simulasyon-stok-log.js` - stock movement log
- `backend/migrate-hatali-urunler-render.js` - faulty products tables
- `backend/migrate-surec-schema.js` - process management schema fixes
- `backend/cleanup-duplicates.js` - duplicate record cleanup
- `backend/sync-recete-to-render.js` - recipe data sync

**Database Schema Files:**
- `backend/database.sql` - Local database schema
- `backend/tum_surec_schema.sql` - Process management schema
- `backend/actual_local_schema.sql` - Exported local schema

**Environment Configuration:**
- `backend/.env` - Contains RENDER_DATABASE_URL and local DATABASE_URL

---

*This skill auto-activates when working with migration files, database schema, or Render deployment patterns.*
