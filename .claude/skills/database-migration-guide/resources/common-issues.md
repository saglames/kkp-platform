# Common Migration Issues & Solutions

## Issue 1: Table Already Exists

**Error:**
```
relation "table_name" already exists
```

**Cause:** Running CREATE TABLE when table exists

**Solutions:**

**Option 1 - Use IF NOT EXISTS:**
```javascript
await client.query(`
  CREATE TABLE IF NOT EXISTS table_name (
    id SERIAL PRIMARY KEY,
    column1 VARCHAR(255)
  )
`);
```

**Option 2 - Check before creating:**
```javascript
const tableExists = await client.query(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'table_name'
  )
`);

if (!tableExists.rows[0].exists) {
  await client.query('CREATE TABLE table_name (...)');
}
```

---

## Issue 2: Column Already Exists

**Error:**
```
column "column_name" already exists
```

**Cause:** Running ALTER TABLE ADD COLUMN when column exists

**Solution:**
```javascript
const hasColumn = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'table_name' AND column_name = 'column_name'
`);

if (hasColumn.rows.length === 0) {
  await client.query(`
    ALTER TABLE table_name
    ADD COLUMN column_name INTEGER DEFAULT 0
  `);
  console.log('✅ column_name added');
} else {
  console.log('✅ column_name already exists');
}
```

**Example from KKP Platform:**
See `migrate-surec-schema.js` - adds `adet` column only if missing

---

## Issue 3: Duplicate Key Violation

**Error:**
```
duplicate key value violates unique constraint "table_name_column_unique"
```

**Cause:** Trying to add UNIQUE constraint when duplicates exist

**Solution:**

**Step 1 - Find duplicates:**
```javascript
const duplicates = await client.query(`
  SELECT column_name, COUNT(*)
  FROM table_name
  GROUP BY column_name
  HAVING COUNT(*) > 1
`);

console.log('Duplicates found:', duplicates.rows);
```

**Step 2 - Clean duplicates:**
```javascript
await client.query(`
  DELETE FROM table_name
  WHERE id NOT IN (
    SELECT MAX(id)
    FROM table_name
    GROUP BY column_name
  )
`);
```

**Step 3 - Add constraint:**
```javascript
await client.query(`
  ALTER TABLE table_name
  ADD CONSTRAINT table_name_column_unique UNIQUE (column_name)
`);
```

**Example from KKP Platform:**
See `cleanup-duplicates.js` - comprehensive duplicate cleanup

---

## Issue 4: Schema Mismatch (Local vs Render)

**Problem:** Local database has different columns than Render

**Symptoms:**
- Queries work locally but fail on Render
- Column does not exist errors on production
- View creation fails

**Solution:**

**Step 1 - Export local schema:**
```bash
pg_dump -U postgres -d kkp_platform --schema-only > local_schema.sql
```

**Step 2 - Compare with Render:**
```javascript
// Check Render columns
const renderCols = await renderClient.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'table_name'
  ORDER BY ordinal_position
`);

console.log('Render columns:', renderCols.rows);
```

**Step 3 - Add missing columns:**
```javascript
const missingColumns = [
  { name: 'adet', type: 'INTEGER', default: 0 },
  { name: 'notlar', type: 'TEXT', default: null }
];

for (const col of missingColumns) {
  await client.query(`
    ALTER TABLE table_name
    ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} DEFAULT ${col.default}
  `);
}
```

**Example from KKP Platform:**
`migrate-surec-schema.js` - fixed missing `adet` column in `surec_temizlemede_olan`

---

## Issue 5: View Creation Fails

**Error:**
```
column to2.adet does not exist
```

**Cause:** Referenced table missing column, or table alias wrong

**Solution:**

**Step 1 - Verify table structure:**
```javascript
const cols = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'surec_temizlemede_olan'
`);

console.log('Table columns:', cols.rows.map(r => r.column_name));
```

**Step 2 - Fix missing columns first:**
```javascript
await client.query(`
  ALTER TABLE surec_temizlemede_olan
  ADD COLUMN IF NOT EXISTS adet INTEGER DEFAULT 0
`);
```

**Step 3 - Create view:**
```javascript
await client.query(`
  CREATE OR REPLACE VIEW surec_anasayfa AS
  SELECT
    u.id,
    COALESCE(to2.adet, 0) as temizlemede_olan
  FROM surec_urunler u
  LEFT JOIN surec_temizlemede_olan to2 ON u.id = to2.urun_id
`);
```

**Example from KKP Platform:**
`migrate-surec-schema.js` - created `surec_anasayfa` view after fixing schema

---

## Issue 6: Foreign Key Constraint Violations

**Error:**
```
insert or update on table "child_table" violates foreign key constraint
```

**Cause:** Referenced parent record doesn't exist

**Solutions:**

**Option 1 - Insert parent first:**
```javascript
await client.query('BEGIN');

// Insert parent
const parent = await client.query(`
  INSERT INTO parent_table (name) VALUES ($1) RETURNING id
`, ['Parent Name']);

// Insert child with parent_id
await client.query(`
  INSERT INTO child_table (parent_id, data)
  VALUES ($1, $2)
`, [parent.rows[0].id, 'Child Data']);

await client.query('COMMIT');
```

**Option 2 - Add ON DELETE CASCADE:**
```javascript
await client.query(`
  ALTER TABLE child_table
  DROP CONSTRAINT IF EXISTS fk_parent,
  ADD CONSTRAINT fk_parent
  FOREIGN KEY (parent_id) REFERENCES parent_table(id)
  ON DELETE CASCADE
`);
```

---

## Issue 7: Sequence Out of Sync

**Error:**
```
duplicate key value violates unique constraint "table_name_pkey"
```

**Cause:** Manually inserted rows, sequence counter not updated

**Symptom:** INSERT fails with "id already exists" even though using SERIAL

**Solution:**
```javascript
await client.query(`
  SELECT setval('table_name_id_seq', (SELECT MAX(id) FROM table_name))
`);
```

**When to use:**
- After bulk data import
- After syncing from local to Render
- After manual INSERT with specific IDs

**Example from KKP Platform:**
`sync-recete-to-render.js` - fixes sequence after syncing recipes

---

## Issue 8: SSL Connection Error

**Error:**
```
no pg_hba.conf entry for host "xxx.xxx.xxx.xxx", SSL off
```

**Cause:** Missing SSL configuration for Render

**Solution:**
```javascript
const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Add this!
});
```

**Why `rejectUnauthorized: false`?**
- Render uses self-signed SSL certificates
- Node.js pg library rejects self-signed certs by default
- This option allows connection despite certificate

---

## Issue 9: Transaction Rollback Not Working

**Problem:** Changes persist even though error occurred

**Cause:** Not using transactions or committing before error

**Bad Code:**
```javascript
// ❌ No transaction - changes persist even if later query fails
await client.query('INSERT INTO table1 ...');
await client.query('INSERT INTO table2 ...');  // Error here
// table1 insert persists!
```

**Good Code:**
```javascript
// ✅ Transaction - all or nothing
await client.query('BEGIN');
try {
  await client.query('INSERT INTO table1 ...');
  await client.query('INSERT INTO table2 ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

---

## Issue 10: Data Type Mismatch

**Error:**
```
column "adet" is of type integer but expression is of type text
```

**Cause:** Inserting string when column expects integer

**Solutions:**

**Option 1 - Cast in JavaScript:**
```javascript
const adet = parseInt(req.body.adet);
await client.query('INSERT INTO table (adet) VALUES ($1)', [adet]);
```

**Option 2 - Cast in SQL:**
```javascript
await client.query('INSERT INTO table (adet) VALUES ($1::INTEGER)', [req.body.adet]);
```

**Option 3 - Fix column type:**
```javascript
await client.query('ALTER TABLE table ALTER COLUMN adet TYPE TEXT');
```

---

## Issue 11: Migration Script Doesn't Run

**Problem:** Script runs but nothing happens, no errors

**Common Causes:**

**Cause 1 - Wrong database URL:**
```javascript
// Check which database you're connecting to
console.log('Connecting to:', process.env.RENDER_DATABASE_URL);
```

**Cause 2 - Missing dotenv:**
```javascript
// Make sure this is at the top
require('dotenv').config();
```

**Cause 3 - .env not loaded:**
```bash
# Check if .env file exists
ls -la backend/.env

# Run from correct directory
cd backend
node migrate-script.js
```

---

## Issue 12: UNIQUE Constraint Already Exists

**Error:**
```
relation "table_name_column_unique" already exists
```

**Cause:** Trying to add UNIQUE constraint that already exists

**Solution:**

**Option 1 - Use IF NOT EXISTS (PostgreSQL 9.6+):**
```javascript
await client.query(`
  ALTER TABLE table_name
  ADD CONSTRAINT IF NOT EXISTS table_name_column_unique UNIQUE (column_name)
`);
```

**Option 2 - Check first:**
```javascript
const hasConstraint = await client.query(`
  SELECT constraint_name
  FROM information_schema.table_constraints
  WHERE table_name = 'table_name'
    AND constraint_name = 'table_name_column_unique'
`);

if (hasConstraint.rows.length === 0) {
  await client.query(`
    ALTER TABLE table_name
    ADD CONSTRAINT table_name_column_unique UNIQUE (column_name)
  `);
}
```

**Option 3 - Use ON CONFLICT:**
```javascript
// Ignore error if constraint exists
await client.query(`
  ALTER TABLE table_name
  ADD CONSTRAINT table_name_column_unique UNIQUE (column_name)
`).catch(err => {
  if (!err.message.includes('already exists')) {
    throw err;
  }
});
```

---

## Issue 13: Permission Denied

**Error:**
```
permission denied for table table_name
```

**Cause:** Database user lacks privileges

**Solution:**

**For Render:** You have full access by default, check:
1. Using correct RENDER_DATABASE_URL
2. Not connecting to wrong database
3. Table actually exists

**For local:** Grant permissions:
```sql
GRANT ALL PRIVILEGES ON TABLE table_name TO postgres;
GRANT USAGE, SELECT ON SEQUENCE table_name_id_seq TO postgres;
```

---

## Debugging Tips

### 1. Enable Query Logging

```javascript
const pool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  log: (msg) => console.log('PG:', msg)  // Log all queries
});
```

### 2. Test Queries Independently

```javascript
// Test each query separately
try {
  console.log('Testing table existence...');
  const test1 = await client.query('SELECT 1 FROM table_name LIMIT 1');
  console.log('✅ Table exists');

  console.log('Testing column existence...');
  const test2 = await client.query('SELECT column_name FROM table_name LIMIT 1');
  console.log('✅ Column exists');

} catch (error) {
  console.error('❌ Test failed:', error.message);
}
```

### 3. Use Verbose Error Messages

```javascript
catch (error) {
  console.error('Error details:');
  console.error('  Message:', error.message);
  console.error('  Code:', error.code);
  console.error('  Detail:', error.detail);
  console.error('  Hint:', error.hint);
  console.error('  Position:', error.position);
}
```

### 4. Check Render Logs

1. Go to Render Dashboard
2. Select your database
3. Click "Logs" tab
4. Look for connection attempts and errors

---

## Getting Help

If stuck:

1. **Check existing migrations:**
   - Look at `backend/migrate-*.js` files
   - Find similar patterns

2. **Test locally first:**
   - Always test on local PostgreSQL
   - Verify queries work before Render

3. **Use check scripts:**
   - `check-render-tables.js` - list all tables
   - `check-column-names.js` - inspect table structure
   - `check-anasayfa-view.js` - verify view exists

4. **Incremental changes:**
   - Make one change at a time
   - Test after each change
   - Easier to debug failures
