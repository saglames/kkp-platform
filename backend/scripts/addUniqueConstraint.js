const pool = require('../db');

async function addUniqueConstraint() {
  try {
    // Önce mevcut constraint var mı kontrol et
    const checkConstraint = await pool.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'kesim_olculeri'
      AND constraint_type = 'UNIQUE'
    `);

    if (checkConstraint.rows.length > 0) {
      console.log('✅ UNIQUE constraint zaten mevcut:', checkConstraint.rows);
    } else {
      // UNIQUE constraint ekle
      await pool.query(`
        ALTER TABLE kesim_olculeri
        ADD CONSTRAINT kesim_olculeri_unique
        UNIQUE (model, alt_grup, parca)
      `);
      console.log('✅ UNIQUE constraint başarıyla eklendi!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

addUniqueConstraint();
