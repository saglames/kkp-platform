const XLSX = require('xlsx');
const path = require('path');

// Read JOINT1.xlsx
console.log('=== JOINT1.xlsx ===\n');
const jointPath = path.join('C:', 'Users', 'ESAT', 'Desktop', 'JOINT1.xlsx');
const jointWorkbook = XLSX.readFile(jointPath);

jointWorkbook.SheetNames.forEach(sheetName => {
  console.log(`Sheet: ${sheetName}`);
  const worksheet = jointWorkbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  if (jsonData.length > 0) {
    console.log('Columns:', Object.keys(jsonData[0]));
    console.log('Total rows:', jsonData.length);
    console.log('Sample rows (first 3):');
    console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
  }
  console.log('\n');
});

// Read FITTINGS1.xlsx
console.log('\n=== FITTINGS1.xlsx ===\n');
const fittingsPath = path.join('C:', 'Users', 'ESAT', 'Desktop', 'FITTINGS1.xlsx');
const fittingsWorkbook = XLSX.readFile(fittingsPath);

fittingsWorkbook.SheetNames.forEach(sheetName => {
  console.log(`Sheet: ${sheetName}`);
  const worksheet = fittingsWorkbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  if (jsonData.length > 0) {
    console.log('Columns:', Object.keys(jsonData[0]));
    console.log('Total rows:', jsonData.length);
    console.log('Sample rows (first 3):');
    console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
  }
  console.log('\n');
});
