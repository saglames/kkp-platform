# Migration Testing Checklist

Use this checklist before running migrations on Render production database.

---

## Pre-Migration Checks

### 1. Environment Setup

- [ ] `.env` file exists in `backend/` directory
- [ ] `RENDER_DATABASE_URL` is set in `.env`
- [ ] `DATABASE_URL` (local) is set in `.env`
- [ ] Both connection strings are valid PostgreSQL URLs
- [ ] `dotenv` package is installed (`npm install dotenv`)

**Test:**
```bash
cd backend
node -e "require('dotenv').config(); console.log('Render URL:', process.env.RENDER_DATABASE_URL)"
```

### 2. Dependencies Installed

- [ ] `pg` package installed (`npm install pg`)
- [ ] `dotenv` package installed
- [ ] No version conflicts in `package.json`

**Test:**
```bash
cd backend
npm list pg dotenv
```

### 3. Local Database Ready

- [ ] PostgreSQL service running locally
- [ ] Local database `kkp_platform` exists
- [ ] Can connect to local database

**Test:**
```bash
psql -U postgres -d kkp_platform -c "SELECT 1"
```

### 4. Migration Script Ready

- [ ] Script follows naming convention (`migrate-*.js`, `sync-*.js`, etc.)
- [ ] Script has `require('dotenv').config()` at top
- [ ] Script uses transactions (BEGIN/COMMIT/ROLLBACK)
- [ ] Script has proper error handling
- [ ] Script logs success/failure clearly

---

## Local Testing

### 1. Test Connection

**Script:** Create `test-connection.js`

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const result = await renderPool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('   Server time:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await renderPool.end();
  }
}

test();
```

**Run:**
```bash
node backend/test-connection.js
```

**Expected:** ✅ Connection successful!

### 2. Test on Local Database First

- [ ] Run migration script pointing to local database
- [ ] Verify no errors in console
- [ ] Check local database for changes

**Modify script temporarily:**
```javascript
// Change this:
const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// To this (for local testing):
const renderPool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

**Run:**
```bash
node backend/migrate-script.js
```

**Verify:**
```bash
psql -U postgres -d kkp_platform -c "\dt"  # List tables
psql -U postgres -d kkp_platform -c "\d table_name"  # Describe table
```

### 3. Test Idempotency

- [ ] Run migration script twice
- [ ] Second run should not error
- [ ] Second run should skip existing changes

**Test:**
```bash
node backend/migrate-script.js
node backend/migrate-script.js  # Run again
```

**Expected:** Second run shows "already exists" messages, no errors

### 4. Test Rollback

**If migration has multiple steps:**

- [ ] Force an error in the middle of migration
- [ ] Verify database is unchanged (transaction rolled back)
- [ ] Fix error and run again successfully

**Example:**
```javascript
await client.query('BEGIN');

await client.query('CREATE TABLE test1 (...)');

// Force error
await client.query('CREATE TABLE nonexistent_reference REFERENCES bad_table(id)');

// Should never reach here
await client.query('CREATE TABLE test2 (...)');

await client.query('COMMIT');
```

**Expected:** test1 table NOT created (rolled back)

---

## Pre-Production Checks

### 1. Backup Existing Data

**If modifying existing tables:**

- [ ] Export production data
- [ ] Save export in safe location
- [ ] Verify export is complete

**Backup script:**
```javascript
// backup-render-data.js
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const renderPool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function backup() {
  try {
    const result = await renderPool.query('SELECT * FROM table_name');
    fs.writeFileSync('backup.json', JSON.stringify(result.rows, null, 2));
    console.log(`✅ Backed up ${result.rows.length} records`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  } finally {
    await renderPool.end();
  }
}

backup();
```

### 2. Review Migration Code

- [ ] Code reviewed by another developer (if possible)
- [ ] SQL queries are correct
- [ ] Parameter placeholders used correctly ($1, $2, etc.)
- [ ] No SQL injection vulnerabilities
- [ ] No hardcoded credentials

**SQL Injection Check:**
```javascript
// ❌ BAD - SQL injection risk
await client.query(`SELECT * FROM users WHERE name = '${userName}'`);

// ✅ GOOD - parameterized query
await client.query('SELECT * FROM users WHERE name = $1', [userName]);
```

### 3. Check Render Database Status

- [ ] Render database is online (not paused)
- [ ] No maintenance scheduled
- [ ] Connection string is current

**Check in Render Dashboard:**
1. Go to database service
2. Verify status is "Available"
3. Check for maintenance notices

### 4. Plan for Downtime

**If migration affects live data:**

- [ ] Schedule migration during low-traffic period
- [ ] Notify users of planned maintenance (if applicable)
- [ ] Prepare rollback plan
- [ ] Have backup ready

---

## Running Migration

### During Migration

**Step 1 - Final connection test:**
```bash
node backend/test-connection.js
```

**Step 2 - Run migration:**
```bash
node backend/migrate-script.js
```

**Step 3 - Watch output:**
- [ ] Migration starts (log message appears)
- [ ] BEGIN transaction logged
- [ ] Each step logs success
- [ ] COMMIT transaction logged
- [ ] Final success message appears

**Expected Output:**
```
Starting migration...

✅ Table created
✅ Column added
✅ Constraint added

✅ Migration completed successfully!
```

### Error Handling

**If error occurs:**

1. **Don't panic** - transaction rolled back automatically
2. **Read error message** - usually indicates the issue
3. **Check common issues** - see `common-issues.md`
4. **Fix and retry** - migrations are idempotent

**Common Errors:**
- `relation already exists` → Use IF NOT EXISTS
- `column already exists` → Check before adding
- `duplicate key violation` → Clean duplicates first
- `SSL connection required` → Add ssl config

---

## Post-Migration Validation

### 1. Verify Database Changes

**Check tables exist:**
```javascript
const tables = await renderPool.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);

console.log('Tables:', tables.rows.map(r => r.table_name));
```

**Check specific table:**
```javascript
const cols = await renderPool.query(`
  SELECT column_name, data_type, column_default
  FROM information_schema.columns
  WHERE table_name = 'your_table_name'
  ORDER BY ordinal_position
`);

console.log('Columns:', cols.rows);
```

**Count records:**
```javascript
const count = await renderPool.query('SELECT COUNT(*) FROM your_table_name');
console.log('Record count:', count.rows[0].count);
```

### 2. Test API Endpoints

**If migration affects API:**

- [ ] Test affected endpoints with curl
- [ ] Verify data structure matches expectations
- [ ] Check for errors in API responses

**Example:**
```bash
# Test endpoint that uses new table
curl https://kkp-platform.onrender.com/api/endpoint

# Test with data
curl -X POST https://kkp-platform.onrender.com/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```

### 3. Test Frontend

**If migration affects UI:**

- [ ] Open production frontend URL
- [ ] Navigate to affected pages
- [ ] Test CRUD operations
- [ ] Check browser console for errors

**Example:**
```
https://kkp-frontend.onrender.com/page-name
```

### 4. Verify Data Integrity

**Check for:**
- [ ] No duplicate records
- [ ] Foreign key relationships intact
- [ ] UNIQUE constraints working
- [ ] Default values applied
- [ ] Data types correct

**Sample queries:**
```javascript
// Check for duplicates
const dupes = await renderPool.query(`
  SELECT column_name, COUNT(*)
  FROM table_name
  GROUP BY column_name
  HAVING COUNT(*) > 1
`);

if (dupes.rows.length > 0) {
  console.warn('⚠️ Duplicates found:', dupes.rows);
}

// Verify foreign keys
const orphans = await renderPool.query(`
  SELECT c.*
  FROM child_table c
  LEFT JOIN parent_table p ON c.parent_id = p.id
  WHERE p.id IS NULL
`);

if (orphans.rows.length > 0) {
  console.warn('⚠️ Orphaned records:', orphans.rows);
}
```

### 5. Monitor for Errors

**Check Render logs:**
1. Go to Render Dashboard
2. Select backend service
3. Click "Logs" tab
4. Look for database errors

**Watch for:**
- Connection errors
- Query failures
- Unexpected behavior

---

## Rollback Procedures

### If Migration Needs Rollback

**Option 1 - Automatic (Transaction Rollback):**
- Only works if migration failed
- Changes automatically rolled back
- Re-run after fixing error

**Option 2 - Manual Rollback:**

**For new table:**
```javascript
await client.query('DROP TABLE IF EXISTS new_table CASCADE');
```

**For new column:**
```javascript
await client.query('ALTER TABLE table_name DROP COLUMN IF EXISTS new_column');
```

**For constraint:**
```javascript
await client.query('ALTER TABLE table_name DROP CONSTRAINT constraint_name');
```

**Option 3 - Restore from Backup:**
```javascript
// restore-backup.js
const backup = require('./backup.json');

for (const row of backup) {
  await client.query(`
    INSERT INTO table_name (col1, col2)
    VALUES ($1, $2)
  `, [row.col1, row.col2]);
}
```

---

## Documentation

### After Successful Migration

- [ ] Update migration log (if maintained)
- [ ] Document schema changes in README or docs
- [ ] Update API documentation if affected
- [ ] Commit migration script to git
- [ ] Add notes to PR/commit message

**Commit message template:**
```
Add [table_name] table to Render database

- Creates [table_name] table with [columns]
- Adds UNIQUE constraint on [column]
- Migrates [X] records from local to Render

Migration script: backend/migrate-[name].js
Tested: ✅ Local, ✅ Render Production
```

---

## Troubleshooting

**Migration script hangs:**
- Check connection string
- Verify database is online
- Look for unfinished transactions
- Check Render logs

**Changes not appearing:**
- Verify connected to correct database
- Check transaction was committed
- Refresh database connection
- Clear any caches

**Can't roll back:**
- Transaction already committed
- Need manual rollback
- Use backup if available
- Recreate migration script

---

## Quick Reference

**Test connection:**
```bash
node backend/test-connection.js
```

**Run migration:**
```bash
node backend/migrate-script.js
```

**Check tables:**
```bash
node backend/check-render-tables.js
```

**Check columns:**
```bash
node backend/check-column-names.js
```

**Verify data:**
```bash
curl https://kkp-platform.onrender.com/api/endpoint
```

**View Render logs:**
- Dashboard → Database → Logs

---

## Final Checklist

Before marking migration complete:

- [ ] ✅ Migration ran without errors
- [ ] ✅ Database changes verified
- [ ] ✅ API endpoints tested
- [ ] ✅ Frontend tested (if applicable)
- [ ] ✅ No duplicate records
- [ ] ✅ Constraints working correctly
- [ ] ✅ Sequences updated (if data imported)
- [ ] ✅ Render logs show no errors
- [ ] ✅ Migration script committed to git
- [ ] ✅ Documentation updated

**Migration Status:** COMPLETED ✅
