const pool = require('./db');

async function fixAllTriggers() {
  try {
    console.log('Tüm problemli trigger ve fonksiyonlar temizleniyor...\n');

    // Tüm trigger'ları göster ve temizle
    const triggers = await pool.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND trigger_name LIKE '%updated_at%'
    `);

    console.log(`Bulunan ${triggers.rows.length} adet updated_at trigger'ı:\n`);

    for (const trigger of triggers.rows) {
      console.log(`  - ${trigger.trigger_name} on ${trigger.event_object_table}`);
      await pool.query(`DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON ${trigger.event_object_table}`);
      console.log(`    ✅ Kaldırıldı`);
    }

    // update_updated_at_column fonksiyonunu kaldır
    console.log('\nupdate_updated_at_column fonksiyonu kaldırılıyor...');
    await pool.query(`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`);
    console.log('✅ Fonksiyon kaldırıldı\n');

    console.log('✅ Tüm trigger ve fonksiyonlar başarıyla temizlendi!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await pool.end();
    process.exit(1);
  }
}

fixAllTriggers();
