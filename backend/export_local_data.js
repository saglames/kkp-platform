// Export ALL data from local database to SQL file
const pool = require('./db');
const fs = require('fs').promises;

async function exportData() {
  try {
    console.log('Starting FULL data export from local database...\n');

    // Get all tables in correct dependency order (parents first)
    const tables = [
      // Core tables first
      'gorevler',
      'gorev_notlar',
      'siparis_hazirlik',
      'siparis_gonderimler',
      'siparis_degisiklik_log',
      'urun_siparisler',
      'urun_siparis_degisiklik_log',

      // Mamul stok
      'mamul_izolasyon',
      'mamul_koli',
      'mamul_kutu',
      'mamul_tapa',
      'mamul_history',

      // Hatali urunler
      'hatali_urunler',
      'hatali_urunler_log',

      // Is emirleri
      'is_emirleri',
      'is_emri_sablonlari',
      'is_emri_operasyon_takip',

      // Kesim
      'kesim_olculeri',

      // Urun recetesi
      'urun_recetesi',
      'recete_malzemeler',
      'siparis_hesaplama_kayitlari',

      // Simulasyon stok
      'simulasyon_stok',
      'simulasyon_stok_hareket_log',

      // Surec
      'surec_urunler',
      'surec_temizlemeye_gidecek',
      'surec_temizlemede_olan',
      'surec_temizlemeden_gelen',
      'surec_sevke_hazir',
      'surec_sevk_edilen',
      'surec_kalan',
      'surec_hareket_log',

      // Teknik resimler
      'teknik_resimler_kategoriler',
      'teknik_resimler_dosyalar',
      'teknik_resimler_login_log',

      // Urun agirliklari
      'urun_agirliklari_master',
      'urun_agirliklari_fittinglar',
      'urun_agirliklari_hesaplamalar'
    ];

    console.log('Exporting tables in dependency order:', tables.length, 'tables\n');

    let sqlOutput = '-- FULL DATA EXPORT from local K.K.P. Platform database\n';
    sqlOutput += '-- Generated: ' + new Date().toISOString() + '\n';
    sqlOutput += '-- This file contains ALL data from ALL tables\n\n';

    let totalRows = 0;

    for (const table of tables) {
      console.log(`Exporting ${table}...`);
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
      console.log(`  Found ${result.rows.length} rows`);

      if (result.rows.length > 0) {
        totalRows += result.rows.length;
        sqlOutput += `-- ========================================\n`;
        sqlOutput += `-- ${table.toUpperCase()} (${result.rows.length} rows)\n`;
        sqlOutput += `-- ========================================\n`;

        for (const row of result.rows) {
          const columns = Object.keys(row).filter(col =>
            col !== 'id' && col !== 'created_at' && col !== 'updated_at'
          );

          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (Array.isArray(val)) {
              const arrayValues = val.map(v => {
                if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
                return v;
              });
              return `ARRAY[${arrayValues.join(', ')}]`;
            }
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          });

          sqlOutput += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlOutput += '\n';
      }
    }

    await fs.writeFile('./real_data_export.sql', sqlOutput, 'utf8');
    console.log('\n✅ FULL Export complete!');
    console.log('📊 Total tables:', tables.length);
    console.log('📊 Total rows:', totalRows);
    console.log('📄 File: real_data_export.sql');
    console.log('💾 Size:', (sqlOutput.length / 1024).toFixed(2), 'KB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Export error:', error);
    process.exit(1);
  }
}

exportData();
