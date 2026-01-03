const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Excel dosyasını analiz eder ve yapısını gösterir
 */
async function analyzeExcelFile(filePath) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const analysis = {
      fileName: path.basename(filePath),
      sheets: []
    };

    workbook.eachSheet((worksheet, sheetId) => {
      const sheetInfo = {
        name: worksheet.name,
        rowCount: worksheet.rowCount,
        columnCount: worksheet.columnCount,
        headers: [],
        sampleData: []
      };

      // İlk satırı başlık olarak al
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        sheetInfo.headers.push({
          column: colNumber,
          value: cell.value,
          type: typeof cell.value
        });
      });

      // İlk 5 satırı örnek veri olarak al
      for (let i = 2; i <= Math.min(6, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = sheetInfo.headers[colNumber - 1];
          rowData[header?.value || `Column${colNumber}`] = cell.value;
        });
        sheetInfo.sampleData.push(rowData);
      }

      analysis.sheets.push(sheetInfo);
    });

    return analysis;
  } catch (error) {
    throw new Error(`Excel analiz hatası: ${error.message}`);
  }
}

/**
 * Kesim ölçüleri Excel dosyasını okur ve veritabanına yükler
 */
async function importKesimOlculeri(filePath, pool) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0]; // İlk sayfa
    const kesimler = [];

    // Başlık satırını oku (1. satır)
    const headerRow = worksheet.getRow(1);
    const headers = {};
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value).toLowerCase().trim();
    });

    // Veri satırlarını oku (2. satırdan başla)
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      // Boş satırları atla
      if (!row.hasValues) continue;

      const kesim = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          kesim[header] = cell.value;
        }
      });

      // En az model ve alt_grup olmalı
      if (kesim.model && kesim.alt_grup) {
        kesimler.push(kesim);
      }
    }

    // Veritabanına kaydet
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Önce mevcut verileri temizle (opsiyonel)
      // await client.query('DELETE FROM kesim_olculeri');

      for (const kesim of kesimler) {
        await client.query(`
          INSERT INTO kesim_olculeri
          (model, alt_grup, parca, dis_cap, et_kalinligi, uzunluk, genisletme, punch, birim_agirlik)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (model, alt_grup, parca)
          DO UPDATE SET
            dis_cap = EXCLUDED.dis_cap,
            et_kalinligi = EXCLUDED.et_kalinligi,
            uzunluk = EXCLUDED.uzunluk,
            genisletme = EXCLUDED.genisletme,
            punch = EXCLUDED.punch,
            birim_agirlik = EXCLUDED.birim_agirlik
        `, [
          kesim.model,
          kesim.alt_grup || kesim['alt grup'],
          kesim.parca || kesim['parça'],
          kesim.dis_cap || kesim['dış çap'] || kesim['dış cap'],
          kesim.et_kalinligi || kesim['et kalınlığı'] || kesim['et'],
          kesim.uzunluk,
          kesim.genisletme || kesim['genişletme'] || null,
          kesim.punch || null,
          kesim.birim_agirlik || kesim['birim ağırlık'] || kesim['birim agirlik'] || null
        ]);
      }

      await client.query('COMMIT');
      return { success: true, count: kesimler.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw new Error(`Kesim ölçüleri import hatası: ${error.message}`);
  }
}

module.exports = {
  analyzeExcelFile,
  importKesimOlculeri
};
