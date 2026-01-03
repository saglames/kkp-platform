const fs = require('fs');

const sql = fs.readFileSync('./real_data_export.sql', 'utf8');
const lines = sql.split('\n');
const sqlWithoutComments = lines
  .filter(line => !line.trim().startsWith('--'))
  .join('\n');

const statements = sqlWithoutComments
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && s.startsWith('INSERT'));

console.log('Total statements:', statements.length);
console.log('\nFirst statement (full):');
console.log(statements[0]);
console.log('\n\nSecond statement (full):');
console.log(statements[1]);

// Test JSON.stringify
console.log('\n\nTesting JSON.stringify on first 2 statements:');
try {
  const json = JSON.stringify({ statements: statements.slice(0, 2) });
  console.log('SUCCESS - JSON length:', json.length);
} catch (e) {
  console.log('ERROR:', e.message);
}
