const ExcelJS = require('exceljs');

async function listAllSheets() {
  try {
    const filePath = 'C:/Users/ESAT/Desktop/1.xlsx';
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    console.log('\n=== 1.xlsx Dosyasındaki Tüm Sayfalar ===\n');

    workbook.eachSheet((worksheet, sheetId) => {
      console.log(`Sayfa ${sheetId}: ${worksheet.name}`);
      console.log(`  - Satır sayısı: ${worksheet.rowCount}`);
      console.log(`  - Sütun sayısı: ${worksheet.columnCount}`);

      // İlk 3 satırı göster
      console.log('  - İlk 3 satır:');
      for (let i = 1; i <= Math.min(3, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const values = [];
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          values.push(`[${colNumber}] ${cell.value}`);
        });
        console.log(`    Satır ${i}: ${values.join(', ')}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Hata:', error.message);
  }
}

listAllSheets();
