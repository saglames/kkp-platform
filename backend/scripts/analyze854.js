const ExcelJS = require('exceljs');

async function analyze854() {
  try {
    const filePath = 'C:/Users/ESAT/Desktop/854.xlsx';
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    console.log('\n=== 854.xlsx Dosya Analizi ===\n');

    workbook.eachSheet((worksheet, sheetId) => {
      console.log(`\n📄 Sayfa ${sheetId}: ${worksheet.name}`);
      console.log(`   Satır: ${worksheet.rowCount}, Sütun: ${worksheet.columnCount}`);

      // İlk 10 satırı detaylı göster
      console.log('\n   İlk 10 satır:');
      for (let i = 1; i <= Math.min(10, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const values = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const val = cell.value === null ? '' : cell.value;
          values.push(`[${colNumber}]=${val}`);
        });
        console.log(`   ${i}: ${values.join(' | ')}`);
      }
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

analyze854();
