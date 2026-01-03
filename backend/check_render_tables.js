// Check which tables exist on Render and their counts
const https = require('https');

const tables = [
  'mamul_izolasyon', 'mamul_koli', 'mamul_kutu', 'mamul_tapa',
  'gorevler', 'siparis_hazirlik', 'urun_siparisler',
  'simulasyon_stok', 'surec_urunler',
  'urun_recetesi', 'kesim_olculeri', 'teknik_resimler_dosyalar'
];

async function checkTable(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`https://kkp-platform.onrender.com${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ endpoint, count: Array.isArray(json) ? json.length : 'NOT ARRAY', status: res.statusCode });
        } catch (e) {
          resolve({ endpoint, count: 'PARSE ERROR', error: e.message, status: res.statusCode });
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Checking Render tables...\n');

  const endpoints = [
    '/api/mamul-stok/izolasyon',
    '/api/mamul-stok/koli',
    '/api/mamul-stok/kutu',
    '/api/mamul-stok/tapa',
    '/api/kalite-kontrol/gorevler',
    '/api/kalite-kontrol/siparis-hazirlik',
    '/api/kalite-kontrol/urun-siparisler',
    '/api/simulasyon-stok',
    '/api/tum-surec/urunler',
    '/api/urun-recetesi',
    '/api/kesim-olculeri'
  ];

  for (const endpoint of endpoints) {
    const result = await checkTable(endpoint);
    console.log(`${endpoint.padEnd(50)} ${result.count} kayıt`);
  }
}

main().catch(console.error);
