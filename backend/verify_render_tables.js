// Verify which tables exist on Render and their current row counts
const https = require('https');

const tables = [
  'gorevler', 'gorev_notlar',
  'siparis_hazirlik', 'siparis_gonderimler', 'siparis_degisiklik_log',
  'urun_siparisler', 'urun_siparis_degisiklik_log',
  'mamul_izolasyon', 'mamul_koli', 'mamul_kutu', 'mamul_tapa', 'mamul_history',
  'hatali_urunler', 'hatali_urunler_log',
  'is_emirleri', 'is_emri_sablonlari', 'is_emri_operasyon_takip',
  'kesim_olculeri',
  'urun_recetesi', 'recete_malzemeler', 'siparis_hesaplama_kayitlari',
  'simulasyon_stok', 'simulasyon_stok_hareket_log',
  'surec_urunler', 'surec_temizlemeye_gidecek', 'surec_temizlemede_olan',
  'surec_temizlemeden_gelen', 'surec_sevke_hazir', 'surec_sevk_edilen',
  'surec_kalan', 'surec_hareket_log',
  'teknik_resimler_kategoriler', 'teknik_resimler_dosyalar', 'teknik_resimler_login_log',
  'urun_agirliklari_master', 'urun_agirliklari_fittinglar', 'urun_agirliklari_hesaplamalar'
];

async function checkTable(tableName) {
  return new Promise((resolve) => {
    const query = `SELECT COUNT(*) FROM ${tableName}`;
    const url = `https://kkp-platform.onrender.com/api/test-db?query=${encodeURIComponent(query)}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ table: tableName, status: res.statusCode, data });
      });
    }).on('error', () => {
      resolve({ table: tableName, status: 'ERROR', data: '' });
    });
  });
}

async function main() {
  console.log('Verifying Render database tables...\n');
  console.log('Table Name'.padEnd(40), 'Status');
  console.log('='.repeat(60));

  for (const table of tables) {
    const result = await checkTable(table);
    const status = result.status === 200 ? 'EXISTS' : 'MISSING/ERROR';
    console.log(table.padEnd(40), status);

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

main().catch(console.error);
