const { Pool } = require('pg');
require('dotenv').config();

// Use Render production database
const pool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateTemizlemeTakip() {
  const client = await pool.connect();

  try {
    console.log('Starting temizleme_takip migration...');
    await client.query('BEGIN');

    // 1. CREATE: temizleme_partiler (Ana parti kayıt tablosu)
    console.log('Creating temizleme_partiler table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS temizleme_partiler (
        id SERIAL PRIMARY KEY,
        parti_no VARCHAR(100) UNIQUE NOT NULL,
        irsaliye_no VARCHAR(100),

        -- Gidiş Bilgileri
        gidis_tarihi DATE NOT NULL,
        gidis_kg NUMERIC(10,2),
        gidis_adet INTEGER NOT NULL,
        gidis_notlar TEXT,

        -- Dönüş Bilgileri
        donus_tarihi DATE,
        donus_kg NUMERIC(10,2),
        donus_adet INTEGER,
        donus_notlar TEXT,

        -- Hesaplanan Değerler (computed columns yerine trigger kullanacağız)
        kg_farki NUMERIC(10,2),
        adet_farki INTEGER,

        -- Durum Takibi
        durum VARCHAR(50) DEFAULT 'gonderildi', -- gonderildi, temizlemede, kalite_kontrol, kabul, red, tekrar_temizlik
        kalite_durum VARCHAR(50), -- kabul, red, tekrar_temizlik
        kalite_kontrol_tarihi TIMESTAMP,
        kalite_kontrol_yapan VARCHAR(100),
        kalite_notlar TEXT,

        -- Tekrar Temizlik
        tekrar_temizlik_sayisi INTEGER DEFAULT 0,
        ana_parti_id INTEGER REFERENCES temizleme_partiler(id),

        -- Meta
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(100)
      );
    `);

    // Index'ler
    console.log('Creating indexes for temizleme_partiler...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_parti_no ON temizleme_partiler(parti_no);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_durum ON temizleme_partiler(durum);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_ana_parti ON temizleme_partiler(ana_parti_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_gidis_tarihi ON temizleme_partiler(gidis_tarihi);
    `);

    // Trigger for kg_farki and adet_farki auto-calculation
    console.log('Creating trigger for auto-calculating farki columns...');
    await client.query(`
      CREATE OR REPLACE FUNCTION calculate_temizleme_farki()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.kg_farki := COALESCE(NEW.donus_kg, 0) - COALESCE(NEW.gidis_kg, 0);
        NEW.adet_farki := COALESCE(NEW.donus_adet, 0) - COALESCE(NEW.gidis_adet, 0);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_calculate_temizleme_farki ON temizleme_partiler;
    `);

    await client.query(`
      CREATE TRIGGER trg_calculate_temizleme_farki
      BEFORE INSERT OR UPDATE ON temizleme_partiler
      FOR EACH ROW
      EXECUTE FUNCTION calculate_temizleme_farki();
    `);

    // 2. CREATE: temizleme_parti_urunler (Partiye ait ürünler)
    console.log('Creating temizleme_parti_urunler table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS temizleme_parti_urunler (
        id SERIAL PRIMARY KEY,
        parti_id INTEGER REFERENCES temizleme_partiler(id) ON DELETE CASCADE,
        urun_id INTEGER REFERENCES surec_urunler(id),

        -- Gidiş
        gidis_adet INTEGER NOT NULL,
        gidis_kg NUMERIC(10,2),

        -- Dönüş
        donus_adet INTEGER DEFAULT 0,
        donus_kg NUMERIC(10,2) DEFAULT 0,

        -- Hesaplanan
        adet_farki INTEGER,
        kg_farki NUMERIC(10,2),

        -- Kalite Hataları
        hata_adet INTEGER DEFAULT 0,
        hata_detay JSONB, -- {temizleme_problemi: 5, vuruk: 2, ...}

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(parti_id, urun_id)
      );
    `);

    console.log('Creating indexes for temizleme_parti_urunler...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_parti_urunler_parti ON temizleme_parti_urunler(parti_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_parti_urunler_urun ON temizleme_parti_urunler(urun_id);
    `);

    // Trigger for parti_urunler farki columns
    console.log('Creating trigger for parti_urunler farki columns...');
    await client.query(`
      CREATE OR REPLACE FUNCTION calculate_parti_urun_farki()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.adet_farki := COALESCE(NEW.donus_adet, 0) - COALESCE(NEW.gidis_adet, 0);
        NEW.kg_farki := COALESCE(NEW.donus_kg, 0) - COALESCE(NEW.gidis_kg, 0);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_calculate_parti_urun_farki ON temizleme_parti_urunler;
    `);

    await client.query(`
      CREATE TRIGGER trg_calculate_parti_urun_farki
      BEFORE INSERT OR UPDATE ON temizleme_parti_urunler
      FOR EACH ROW
      EXECUTE FUNCTION calculate_parti_urun_farki();
    `);

    // 3. CREATE: temizleme_kalite_kontrol_log (Kalite kontrol geçmişi)
    console.log('Creating temizleme_kalite_kontrol_log table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS temizleme_kalite_kontrol_log (
        id SERIAL PRIMARY KEY,
        parti_id INTEGER REFERENCES temizleme_partiler(id) ON DELETE CASCADE,

        -- Karar
        karar VARCHAR(50) NOT NULL, -- kabul, red, tekrar_temizlik
        karar_veren VARCHAR(100) NOT NULL,
        karar_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        -- Detaylar
        kontrol_edilen_adet INTEGER,
        hata_tespit_edilen_adet INTEGER,
        hata_orani NUMERIC(5,2), -- Yüzde olarak

        -- Açıklama
        aciklama TEXT,
        problem_kategorileri JSONB, -- ["temizleme_hatalı", "pim_girmeyen"]

        -- Aksiyon
        aksiyon VARCHAR(50), -- sevke_hazir, temizlemeye_geri, hurda

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating index for temizleme_kalite_kontrol_log...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_temizleme_kalite_kontrol_parti ON temizleme_kalite_kontrol_log(parti_id);
    `);

    // 4. ALTER: surec_temizlemeye_gidecek - Parti referansı ekle
    console.log('Altering surec_temizlemeye_gidecek...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_temizlemeye_gidecek' AND column_name = 'parti_id'
        ) THEN
          ALTER TABLE surec_temizlemeye_gidecek ADD COLUMN parti_id INTEGER REFERENCES temizleme_partiler(id);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_temizlemeye_gidecek' AND column_name = 'gidis_kg'
        ) THEN
          ALTER TABLE surec_temizlemeye_gidecek ADD COLUMN gidis_kg NUMERIC(10,2);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_surec_temizlemeye_gidecek_parti ON surec_temizlemeye_gidecek(parti_id);
    `);

    // 5. ALTER: surec_temizlemede_olan - Parti referansı ekle
    console.log('Altering surec_temizlemede_olan...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_temizlemede_olan' AND column_name = 'parti_id'
        ) THEN
          ALTER TABLE surec_temizlemede_olan ADD COLUMN parti_id INTEGER REFERENCES temizleme_partiler(id);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_temizlemede_olan' AND column_name = 'gidis_kg'
        ) THEN
          ALTER TABLE surec_temizlemede_olan ADD COLUMN gidis_kg NUMERIC(10,2);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_surec_temizlemede_olan_parti ON surec_temizlemede_olan(parti_id);
    `);

    // 6. ALTER: surec_temizlemeden_gelen - Kalite kontrol durumu ekle
    console.log('Altering surec_temizlemeden_gelen...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_temizlemeden_gelen' AND column_name = 'parti_id'
        ) THEN
          ALTER TABLE surec_temizlemeden_gelen ADD COLUMN parti_id INTEGER REFERENCES temizleme_partiler(id);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_temizlemeden_gelen' AND column_name = 'kalite_kontrol_durum'
        ) THEN
          ALTER TABLE surec_temizlemeden_gelen ADD COLUMN kalite_kontrol_durum VARCHAR(50) DEFAULT 'beklemede';
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_surec_temizlemeden_gelen_parti ON surec_temizlemeden_gelen(parti_id);
    `);

    // 7. ALTER: surec_hareket_log - Parti takibi için genişletme
    console.log('Altering surec_hareket_log...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_hareket_log' AND column_name = 'parti_id'
        ) THEN
          ALTER TABLE surec_hareket_log ADD COLUMN parti_id INTEGER REFERENCES temizleme_partiler(id);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_hareket_log' AND column_name = 'parti_no'
        ) THEN
          ALTER TABLE surec_hareket_log ADD COLUMN parti_no VARCHAR(100);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_hareket_log' AND column_name = 'gidis_kg'
        ) THEN
          ALTER TABLE surec_hareket_log ADD COLUMN gidis_kg NUMERIC(10,2);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'surec_hareket_log' AND column_name = 'donus_kg'
        ) THEN
          ALTER TABLE surec_hareket_log ADD COLUMN donus_kg NUMERIC(10,2);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_surec_hareket_log_parti ON surec_hareket_log(parti_id);
    `);

    // 8. ALTER: hatali_urunler - Parti referansı ekle
    console.log('Altering hatali_urunler...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'hatali_urunler' AND column_name = 'temizleme_parti_id'
        ) THEN
          ALTER TABLE hatali_urunler ADD COLUMN temizleme_parti_id INTEGER REFERENCES temizleme_partiler(id);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'hatali_urunler' AND column_name = 'kaynak'
        ) THEN
          ALTER TABLE hatali_urunler ADD COLUMN kaynak VARCHAR(50) DEFAULT 'kalite_kontrol';
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hatali_urunler_temizleme_parti ON hatali_urunler(temizleme_parti_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');

    // Verify tables
    console.log('\nVerifying tables...');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'temizleme%'
      ORDER BY table_name;
    `);
    console.log('Created tables:', tables.rows.map(r => r.table_name));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateTemizlemeTakip()
  .then(() => {
    console.log('\n🎉 Temizleme takip migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
