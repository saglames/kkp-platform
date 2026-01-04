const { Pool } = require('pg');
require('dotenv').config();

// Use Render production database
const pool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateTemizlemeOdeme() {
  const client = await pool.connect();

  try {
    console.log('Starting temizleme_odeme (payment) migration...');
    await client.query('BEGIN');

    // 1. CREATE: temizleme_fiyatlandirma (Pricing configuration)
    console.log('Creating temizleme_fiyatlandirma table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS temizleme_fiyatlandirma (
        id SERIAL PRIMARY KEY,
        urun_tipi VARCHAR(50), -- 'A', 'B', 'genel' gibi
        birim_fiyat_kg NUMERIC(10,2) NOT NULL,
        birim_fiyat_adet NUMERIC(10,2) NOT NULL,
        gecerli_tarih_baslangic DATE NOT NULL,
        gecerli_tarih_bitis DATE,
        aktif BOOLEAN DEFAULT true,
        notlar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_fiyatlandirma_aktif ON temizleme_fiyatlandirma(aktif);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_fiyatlandirma_tarih ON temizleme_fiyatlandirma(gecerli_tarih_baslangic, gecerli_tarih_bitis);
    `);

    // Varsayılan fiyatlandırma ekle
    console.log('Inserting default pricing...');
    await client.query(`
      INSERT INTO temizleme_fiyatlandirma (urun_tipi, birim_fiyat_kg, birim_fiyat_adet, gecerli_tarih_baslangic, aktif, notlar, created_by)
      VALUES ('genel', 0.75, 5.50, CURRENT_DATE, true, 'Varsayılan fiyatlandırma', 'Sistem')
      ON CONFLICT DO NOTHING;
    `);

    // 2. ALTER: temizleme_partiler - Ödeme bilgileri ekle
    console.log('Adding payment fields to temizleme_partiler...');
    await client.query(`
      DO $$
      BEGIN
        -- Birim fiyatlar
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_partiler' AND column_name = 'birim_fiyat_kg'
        ) THEN
          ALTER TABLE temizleme_partiler ADD COLUMN birim_fiyat_kg NUMERIC(10,2);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_partiler' AND column_name = 'birim_fiyat_adet'
        ) THEN
          ALTER TABLE temizleme_partiler ADD COLUMN birim_fiyat_adet NUMERIC(10,2);
        END IF;

        -- Ödeme durumu
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_partiler' AND column_name = 'odeme_durumu'
        ) THEN
          ALTER TABLE temizleme_partiler ADD COLUMN odeme_durumu VARCHAR(50) DEFAULT 'beklemede';
        END IF;

        -- Ödenecek tutar (hesaplanan)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_partiler' AND column_name = 'odenecek_tutar'
        ) THEN
          ALTER TABLE temizleme_partiler ADD COLUMN odenecek_tutar NUMERIC(12,2);
        END IF;

        -- Ödenen tutar
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_partiler' AND column_name = 'odenen_tutar'
        ) THEN
          ALTER TABLE temizleme_partiler ADD COLUMN odenen_tutar NUMERIC(12,2) DEFAULT 0;
        END IF;

        -- Ödeme tarihi
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_partiler' AND column_name = 'odeme_tarihi'
        ) THEN
          ALTER TABLE temizleme_partiler ADD COLUMN odeme_tarihi DATE;
        END IF;

        -- Ödeme notları
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_partiler' AND column_name = 'odeme_notlari'
        ) THEN
          ALTER TABLE temizleme_partiler ADD COLUMN odeme_notlari TEXT;
        END IF;
      END $$;
    `);

    // 3. ALTER: temizleme_parti_urunler - Ödenecek miktarlar ekle
    console.log('Adding payable quantity fields to temizleme_parti_urunler...');
    await client.query(`
      DO $$
      BEGIN
        -- Ödenecek adet (kaliteden geçen)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_parti_urunler' AND column_name = 'odenecek_adet'
        ) THEN
          ALTER TABLE temizleme_parti_urunler ADD COLUMN odenecek_adet INTEGER;
        END IF;

        -- Ödenecek kg (kaliteden geçen)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_parti_urunler' AND column_name = 'odenecek_kg'
        ) THEN
          ALTER TABLE temizleme_parti_urunler ADD COLUMN odenecek_kg NUMERIC(10,2);
        END IF;

        -- Ödenmeyecek adet (kalite kontrol red)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_parti_urunler' AND column_name = 'odenmeyecek_adet'
        ) THEN
          ALTER TABLE temizleme_parti_urunler ADD COLUMN odenmeyecek_adet INTEGER DEFAULT 0;
        END IF;

        -- Ödenmeyecek kg (kalite kontrol red)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'temizleme_parti_urunler' AND column_name = 'odenmeyecek_kg'
        ) THEN
          ALTER TABLE temizleme_parti_urunler ADD COLUMN odenmeyecek_kg NUMERIC(10,2) DEFAULT 0;
        END IF;
      END $$;
    `);

    // 4. CREATE: temizleme_odeme_log (Payment history)
    console.log('Creating temizleme_odeme_log table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS temizleme_odeme_log (
        id SERIAL PRIMARY KEY,
        parti_id INTEGER REFERENCES temizleme_partiler(id) ON DELETE CASCADE,

        -- Ödeme Bilgileri
        odeme_tipi VARCHAR(50) NOT NULL, -- tam/kismen/iptal
        odeme_tutari NUMERIC(12,2) NOT NULL,
        odeme_tarihi DATE NOT NULL,
        odeme_yontemi VARCHAR(50), -- nakit/havale/cek/kredi_karti

        -- Açıklama
        aciklama TEXT,

        -- Meta
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_odeme_log_parti ON temizleme_odeme_log(parti_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_odeme_log_tarih ON temizleme_odeme_log(odeme_tarihi);
    `);

    await client.query('COMMIT');
    console.log('✅ Payment migration completed successfully!');

    // Verify tables
    console.log('\nVerifying tables...');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE 'temizleme%' OR table_name LIKE '%fiyat%' OR table_name LIKE '%odeme%')
      ORDER BY table_name;
    `);
    console.log('Payment-related tables:', tables.rows.map(r => r.table_name));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Payment migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateTemizlemeOdeme()
  .then(() => {
    console.log('\n🎉 Temizleme payment migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
