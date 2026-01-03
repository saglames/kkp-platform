const ExcelJS = require('exceljs');
const fs = require('fs');

async function analyzeAllTemplates() {
  const folderPath = 'C:/Users/ESAT/Desktop/Yeni klasör';
  const files = ['A.xlsx', 'B.xlsx', 'AA.xlsx', 'BA.xlsx'];

  for (const file of files) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`DOSYA: ${file}`);
    console.log('='.repeat(60));

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(`${folderPath}/${file}`);

      const worksheet = workbook.worksheets[0];

      console.log(`Sayfa: ${worksheet.name}`);
      console.log(`Satır: ${worksheet.rowCount}, Kolon: ${worksheet.columnCount}\n`);

      // Önemli hücreleri bul (dolu ve merge olmayan)
      console.log('ÖNEMLİ HÜCRELER:');

      const importantCells = [];

      for (let row = 1; row <= Math.min(30, worksheet.rowCount); row++) {
        const rowObj = worksheet.getRow(row);

        rowObj.eachCell((cell, colNum) => {
          if (cell.value && typeof cell.value === 'string') {
            const value = cell.value.trim();

            // Önemli anahtar kelimeleri ara
            if (
              value.includes('İş Emri') ||
              value.includes('Tarih') ||
              value.includes('Model') ||
              value.includes('Adet') ||
              value.includes('Sipariş') ||
              value.includes('Malzeme') ||
              value.includes('Operasyon') ||
              value.includes('No') ||
              (value.length < 50 && !cell.isMerged)
            ) {
              importantCells.push({
                row,
                col: colNum,
                value: value.substring(0, 50),
                isMerged: cell.isMerged,
                isBold: cell.font?.bold || false
              });
            }
          }
        });
      }

      // Sadece önemli olanları göster (merge olmayan veya bold)
      importantCells
        .filter(c => !c.isMerged || c.isBold)
        .forEach(c => {
          console.log(`  [${c.row},${c.col}] = "${c.value}"${c.isBold ? ' (BOLD)' : ''}`);
        });

    } catch (error) {
      console.error(`Hata (${file}):`, error.message);
    }
  }
}

analyzeAllTemplates();
