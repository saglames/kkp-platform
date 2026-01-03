// Batch import data to Render in smaller chunks to avoid timeout
const https = require('https');
const fs = require('fs').promises;

const RENDER_URL = 'kkp-platform.onrender.com';
const BATCH_SIZE = 50; // Import 50 statements at a time

async function importBatch(statements) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ statements });

    const options = {
      hostname: RENDER_URL,
      path: '/api/import-batch',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 30000 // 30 second timeout
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve(json);
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse response', raw: responseData });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('Reading SQL export file...');
    const sql = await fs.readFile('./real_data_export.sql', 'utf8');

    // Remove comments and split into statements
    const lines = sql.split('\n');
    const sqlWithoutComments = lines
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = sqlWithoutComments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.startsWith('INSERT'));

    console.log(`Found ${statements.length} INSERT statements`);
    console.log(`Will import in batches of ${BATCH_SIZE}\\n`);

    // Split into batches
    const batches = [];
    for (let i = 0; i < statements.length; i += BATCH_SIZE) {
      batches.push(statements.slice(i, i + BATCH_SIZE));
    }

    console.log(`Total batches: ${batches.length}\\n`);

    let totalSuccess = 0;
    let totalErrors = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`[${i + 1}/${batches.length}] Importing batch (${batch.length} statements)...`);

      try {
        const result = await importBatch(batch);
        if (result.success) {
          console.log(`  ✓ Success: ${result.successCount}/${batch.length}`);
          totalSuccess += result.successCount;
          totalErrors += result.errorCount;

          if (result.errorCount > 0) {
            console.log(`  ✗ Errors: ${result.errorCount}`);
            if (result.errors && result.errors.length > 0) {
              result.errors.slice(0, 3).forEach(err => {
                console.log(`    - ${err.table}: ${err.error}`);
              });
            }
          }
        } else {
          console.log(`  ✗ Batch failed: ${result.error || result.message}`);
          totalErrors += batch.length;
        }
      } catch (error) {
        console.log(`  ✗ Request failed: ${error.message}`);
        totalErrors += batch.length;
      }

      // Wait a bit between batches to avoid overwhelming the server
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\\n========================================`);
    console.log(`Import Complete!`);
    console.log(`Total Statements: ${statements.length}`);
    console.log(`Successful: ${totalSuccess}`);
    console.log(`Failed: ${totalErrors}`);
    console.log(`========================================`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
