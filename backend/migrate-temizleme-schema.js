const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateTemizlemeSchema() {
  const client = await pool.connect();

  try {
    console.log('Temizleme Takip schema migration baslatiliyor...\n');

    await client.query('BEGIN');

    // 1. Mevcut tablolara kolon eklemeleri
    console.log('1. Mevcut tablolara kolonlar ekleniyor...');

    // hatali_urunler tablosuna kolonlar
    await client.query(`
      ALTER TABLE hatali_urunler
      ADD COLUMN IF NOT EXISTS temizleme_parti_id integer,
      ADD COLUMN IF NOT EXISTS kaynak character varying(50) DEFAULT 'kalite_kontrol';
    `);
    console.log('   OK: hatali_urunler tablosu guncellendi');

    // surec_hareket_log tablosuna kolonlar
    await client.query(`
      ALTER TABLE surec_hareket_log
      ADD COLUMN IF NOT EXISTS parti_id integer,
      ADD COLUMN IF NOT EXISTS parti_no character varying(100),
      ADD COLUMN IF NOT EXISTS gidis_kg numeric(10,2),
      ADD COLUMN IF NOT EXISTS donus_kg numeric(10,2);
    `);
    console.log('   OK: surec_hareket_log tablosu guncellendi');

    // surec_temizlemede_olan tablosuna kolonlar
    await client.query(`
      ALTER TABLE surec_temizlemede_olan
      ADD COLUMN IF NOT EXISTS parti_id integer,
      ADD COLUMN IF NOT EXISTS gidis_kg numeric(10,2);
    `);
    console.log('   OK: surec_temizlemede_olan tablosu guncellendi');

    // surec_temizlemeden_gelen tablosuna kolonlar
    await client.query(`
      ALTER TABLE surec_temizlemeden_gelen
      ADD COLUMN IF NOT EXISTS parti_id integer,
      ADD COLUMN IF NOT EXISTS kalite_kontrol_durum character varying(50) DEFAULT 'beklemede';
    `);
    console.log('   OK: surec_temizlemeden_gelen tablosu guncellendi\n');

    // 2. Yeni tabloları oluştur
    console.log('2. Yeni tablolar olusturuluyor...');

    // temizleme_partiler tablosu
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS temizleme_partiler_id_seq;

      CREATE TABLE IF NOT EXISTS temizleme_partiler (
        id integer DEFAULT nextval('temizleme_partiler_id_seq') NOT NULL PRIMARY KEY,
        parti_no character varying(100) UNIQUE NOT NULL,
        irsaliye_no character varying(100),
        gidis_tarihi date NOT NULL,
        gidis_kg numeric(10,2) DEFAULT 0,
        gidis_adet integer DEFAULT 0,
        gidis_notlar text,
        donus_tarihi date,
        donus_kg numeric(10,2) DEFAULT 0,
        donus_adet integer DEFAULT 0,
        donus_notlar text,
        kg_farki numeric(10,2) GENERATED ALWAYS AS (donus_kg - gidis_kg) STORED,
        adet_farki integer GENERATED ALWAYS AS (donus_adet - gidis_adet) STORED,
        durum character varying(50) DEFAULT 'gonderildi',
        kalite_durum character varying(50),
        kalite_kontrol_tarihi timestamp without time zone,
        kalite_kontrol_yapan character varying(100),
        kalite_notlar text,
        tekrar_temizlik_sayisi integer DEFAULT 0,
        ana_parti_id integer,
        odeme_durumu character varying(50) DEFAULT 'odenecek',
        odenen_tutar numeric(10,2) DEFAULT 0,
        kalan_borc numeric(10,2) DEFAULT 0,
        birim_fiyat_kg numeric(10,2),
        birim_fiyat_adet numeric(10,2),
        odenecek_tutar numeric(10,2),
        odeme_tarihi timestamp without time zone,
        odeme_notlari text,
        created_by character varying(100),
        updated_by character varying(100),
        yapan character varying(100),
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   OK: temizleme_partiler tablosu oluşturuldu');

    // temizleme_parti_urunler tablosu
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS temizleme_parti_urunler_id_seq;

      CREATE TABLE IF NOT EXISTS temizleme_parti_urunler (
        id integer DEFAULT nextval('temizleme_parti_urunler_id_seq') NOT NULL PRIMARY KEY,
        parti_id integer NOT NULL,
        urun_id integer NOT NULL,
        gidis_adet integer DEFAULT 0,
        gidis_kg numeric(10,2) DEFAULT 0,
        donus_adet integer DEFAULT 0,
        donus_kg numeric(10,2) DEFAULT 0,
        adet_farki integer GENERATED ALWAYS AS (donus_adet - gidis_adet) STORED,
        kg_farki numeric(10,2) GENERATED ALWAYS AS (donus_kg - gidis_kg) STORED,
        hata_adet integer DEFAULT 0,
        hata_detay jsonb,
        odenecek_adet integer,
        odenecek_kg numeric(10,2),
        odenmeyecek_adet integer,
        odenmeyecek_kg numeric(10,2),
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   OK: temizleme_parti_urunler tablosu oluşturuldu');

    // temizleme_kalite_kontrol_log tablosu
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS temizleme_kalite_kontrol_log_id_seq;

      CREATE TABLE IF NOT EXISTS temizleme_kalite_kontrol_log (
        id integer DEFAULT nextval('temizleme_kalite_kontrol_log_id_seq') NOT NULL PRIMARY KEY,
        parti_id integer NOT NULL,
        karar character varying(50) NOT NULL,
        karar_veren character varying(100),
        karar_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        kontrol_edilen_adet integer DEFAULT 0,
        hata_tespit_edilen_adet integer DEFAULT 0,
        hata_orani numeric(5,2) DEFAULT 0,
        aciklama text,
        problem_kategorileri jsonb,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   OK: temizleme_kalite_kontrol_log tablosu oluşturuldu');

    // temizleme_fiyatlandirma tablosu
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS temizleme_fiyatlandirma_id_seq;

      CREATE TABLE IF NOT EXISTS temizleme_fiyatlandirma (
        id integer DEFAULT nextval('temizleme_fiyatlandirma_id_seq') NOT NULL PRIMARY KEY,
        urun_id integer NOT NULL,
        kg_birim_fiyat numeric(10,2) DEFAULT 0,
        adet_birim_fiyat numeric(10,2) DEFAULT 0,
        fiyat_tipi character varying(50) DEFAULT 'kg',
        aktif boolean DEFAULT true,
        gecerlilik_baslangic date DEFAULT CURRENT_DATE,
        gecerlilik_bitis date,
        olusturan character varying(100),
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   OK: temizleme_fiyatlandirma tablosu oluşturuldu');

    // temizleme_odeme_log tablosu
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS temizleme_odeme_log_id_seq;

      CREATE TABLE IF NOT EXISTS temizleme_odeme_log (
        id integer DEFAULT nextval('temizleme_odeme_log_id_seq') NOT NULL PRIMARY KEY,
        parti_id integer NOT NULL,
        odeme_tipi character varying(50),
        odeme_tutari numeric(10,2) NOT NULL,
        odeme_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        odeme_yontemi character varying(100),
        aciklama text,
        odeme_yapan character varying(100),
        odeme_notu text,
        created_by character varying(100),
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   OK: temizleme_odeme_log tablosu oluşturuldu\n');

    // 3. Foreign key constraintleri ekle
    console.log('3.  Foreign key constraintler ekleniyor...');

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_parti_ana_parti'
        ) THEN
          ALTER TABLE temizleme_partiler
          ADD CONSTRAINT fk_parti_ana_parti
          FOREIGN KEY (ana_parti_id) REFERENCES temizleme_partiler(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_parti_urunler_parti'
        ) THEN
          ALTER TABLE temizleme_parti_urunler
          ADD CONSTRAINT fk_parti_urunler_parti
          FOREIGN KEY (parti_id) REFERENCES temizleme_partiler(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_parti_urunler_urun'
        ) THEN
          ALTER TABLE temizleme_parti_urunler
          ADD CONSTRAINT fk_parti_urunler_urun
          FOREIGN KEY (urun_id) REFERENCES surec_urunler(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_kalite_kontrol_parti'
        ) THEN
          ALTER TABLE temizleme_kalite_kontrol_log
          ADD CONSTRAINT fk_kalite_kontrol_parti
          FOREIGN KEY (parti_id) REFERENCES temizleme_partiler(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_fiyatlandirma_urun'
        ) THEN
          ALTER TABLE temizleme_fiyatlandirma
          ADD CONSTRAINT fk_fiyatlandirma_urun
          FOREIGN KEY (urun_id) REFERENCES surec_urunler(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_odeme_log_parti'
        ) THEN
          ALTER TABLE temizleme_odeme_log
          ADD CONSTRAINT fk_odeme_log_parti
          FOREIGN KEY (parti_id) REFERENCES temizleme_partiler(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_hatali_urunler_parti'
        ) THEN
          ALTER TABLE hatali_urunler
          ADD CONSTRAINT fk_hatali_urunler_parti
          FOREIGN KEY (temizleme_parti_id) REFERENCES temizleme_partiler(id);
        END IF;
      END $$;
    `);
    console.log('   OK: Foreign key constraintler eklendi\n');

    // 4. Unique constraintler ekle
    console.log('4.  Unique constraintler ekleniyor...');

    await client.query(`
      DO $$
      BEGIN
        -- hatali_urunler için unique constraint (parti_no, urun_kodu kombinasyonu)
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_hatali_urunler_parti_urun'
        ) THEN
          ALTER TABLE hatali_urunler
          ADD CONSTRAINT uq_hatali_urunler_parti_urun UNIQUE (parti_no, urun_kodu);
        END IF;
      END $$;
    `);
    console.log('   OK: Unique constraintler eklendi\n');

    // 5. İndeksleri oluştur
    console.log('5.  İndeksler oluşturuluyor...');

    await client.query(`
      -- Temel indeksler
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_parti_no ON temizleme_partiler(parti_no);
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_durum ON temizleme_partiler(durum);
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_gidis_tarihi ON temizleme_partiler(gidis_tarihi);
      CREATE INDEX IF NOT EXISTS idx_temizleme_parti_urunler_parti_id ON temizleme_parti_urunler(parti_id);
      CREATE INDEX IF NOT EXISTS idx_temizleme_parti_urunler_urun_id ON temizleme_parti_urunler(urun_id);
      CREATE INDEX IF NOT EXISTS idx_temizleme_kalite_kontrol_parti_id ON temizleme_kalite_kontrol_log(parti_id);
      CREATE INDEX IF NOT EXISTS idx_hatali_urunler_temizleme_parti_id ON hatali_urunler(temizleme_parti_id);
      CREATE INDEX IF NOT EXISTS idx_surec_temizlemede_olan_parti_id ON surec_temizlemede_olan(parti_id);
      CREATE INDEX IF NOT EXISTS idx_surec_temizlemeden_gelen_parti_id ON surec_temizlemeden_gelen(parti_id);

      -- Performans optimizasyonu için composite indeksler
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_durum_tarihi
        ON temizleme_partiler(durum, gidis_tarihi);
      CREATE INDEX IF NOT EXISTS idx_temizleme_partiler_odeme_durum
        ON temizleme_partiler(odeme_durumu);
      CREATE INDEX IF NOT EXISTS idx_temizleme_kalite_karar
        ON temizleme_kalite_kontrol_log(karar);
    `);
    console.log('   OK: İndeksler oluşturuldu\n');

    await client.query('COMMIT');

    console.log(' Migration basariyla tamamlandi!\n');
    console.log('Olusturulan tablolar:');
    console.log('   - temizleme_partiler');
    console.log('   - temizleme_parti_urunler');
    console.log('   - temizleme_kalite_kontrol_log');
    console.log('   - temizleme_fiyatlandirma');
    console.log('   - temizleme_odeme_log\n');
    console.log('Guncellenen tablolar:');
    console.log('   - hatali_urunler');
    console.log('   - surec_hareket_log');
    console.log('   - surec_temizlemede_olan');
    console.log('   - surec_temizlemeden_gelen\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration hatasi:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Script'i calistir
migrateTemizlemeSchema()
  .then(() => {
    console.log('Tum islemler basarili!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal hata:', error);
    process.exit(1);
  });
