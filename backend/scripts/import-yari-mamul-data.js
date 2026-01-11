const XLSX = require('xlsx');
const path = require('path');
const pool = require('../db');

async function importJointler() {
  console.log('=== Jointler Import Başlıyor ===\n');

  const jointPath = path.join('C:', 'Users', 'ESAT', 'Desktop', 'JOINT1.xlsx');
  const workbook = XLSX.readFile(jointPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Toplam ${jsonData.length} joint bulundu\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const row of jsonData) {
    try {
      await pool.query(
        `INSERT INTO yari_mamul_jointler (urun, a_adet, b_adet, c_adet, d_adet, kg)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (urun) DO UPDATE
         SET a_adet = EXCLUDED.a_adet,
             b_adet = EXCLUDED.b_adet,
             c_adet = EXCLUDED.c_adet,
             d_adet = EXCLUDED.d_adet,
             kg = EXCLUDED.kg`,
        [
          row['Ürün'],
          row['A Adet'] || 0,
          row['B Adet'] || 0,
          row['C Adet'] || 0,
          row['D Adet'] || 0,
          row['KG'] || 0
        ]
      );
      successCount++;
      console.log(`✓ ${row['Ürün']} eklendi`);
    } catch (error) {
      errorCount++;
      console.error(`✗ ${row['Ürün']} eklenemedi:`, error.message);
    }
  }

  console.log(`\nJointler import sonucu: ${successCount} başarılı, ${errorCount} hata\n`);
}

async function importFittingsler() {
  console.log('=== Fittingsler Import Başlıyor ===\n');

  const fittingsPath = path.join('C:', 'Users', 'ESAT', 'Desktop', 'FITTINGS1.xlsx');
  const workbook = XLSX.readFile(fittingsPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Toplam ${jsonData.length} fittings bulundu\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const row of jsonData) {
    try {
      await pool.query(
        `INSERT INTO yari_mamul_fittingsler (urun, adet, kg)
         VALUES ($1, $2, $3)
         ON CONFLICT (urun) DO UPDATE
         SET adet = EXCLUDED.adet,
             kg = EXCLUDED.kg`,
        [
          row['Ürün'],
          row['Adet'] || 0,
          row['KG'] || 0
        ]
      );
      successCount++;
      console.log(`✓ ${row['Ürün']} eklendi`);
    } catch (error) {
      errorCount++;
      console.error(`✗ ${row['Ürün']} eklenemedi:`, error.message);
    }
  }

  console.log(`\nFittingsler import sonucu: ${successCount} başarılı, ${errorCount} hata\n`);
}

async function main() {
  try {
    await importJointler();
    await importFittingsler();
    console.log('=== Tüm import işlemleri tamamlandı ===');
    process.exit(0);
  } catch (error) {
    console.error('Import hatası:', error);
    process.exit(1);
  }
}

main();
