const ExcelJS = require('exceljs');

async function analyzeTemplate() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('C:/Users/ESAT/Desktop/Yeni klasör/A.xlsx');

    const worksheet = workbook.worksheets[0];

    console.log('=== İŞ EMRİ ŞABLONU DETAYLI ANALİZ ===\n');
    console.log(`Sayfa: ${worksheet.name}`);
    console.log(`Toplam Satır: ${worksheet.rowCount}`);
    console.log(`Toplam Kolon: ${worksheet.columnCount}\n`);

    // Tüm dolu hücreleri göster
    console.log('=== DOLU HÜC RELER ===\n');

    for (let rowNum = 1; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);

      if (!row.hasValues) continue;

      row.eachCell((cell, colNum) => {
        if (cell.value && cell.value !== '') {
          // Merge edilmiş hücre mi kontrol et
          const isMerged = cell.isMerged;
          const master = cell.master || cell;

          console.log(`[${rowNum},${colNum}] = "${cell.value}"${isMerged ? ' (MERGED)' : ''}`);

          // Font ve stil bilgisi
          if (cell.font) {
            if (cell.font.bold) console.log(`  → BOLD`);
            if (cell.font.size) console.log(`  → Font Size: ${cell.font.size}`);
          }

          // Border
          if (cell.border && Object.keys(cell.border).length > 0) {
            console.log(`  → HAS BORDER`);
          }

          // Fill (Background)
          if (cell.fill && cell.fill.type) {
            console.log(`  → Background Fill`);
          }
        }
      });
    }

    // Merge edilmiş aralıkları göster
    console.log('\n\n=== MERGE EDİLMİŞ HÜCRELER ===\n');
    if (worksheet._merges && Object.keys(worksheet._merges).length > 0) {
      Object.keys(worksheet._merges).forEach(range => {
        console.log(`Merge: ${range}`);
      });
    }

  } catch (error) {
    console.error('Hata:', error.message);
  }
}

analyzeTemplate();
