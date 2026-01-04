-- Temizleme Takip Sistemi için Veritabanı Tabloları
-- Created: 2026-01-05

-- 1. Sevkiyatlar Tablosu
CREATE TABLE IF NOT EXISTS temizleme_sevkiyat (
  id SERIAL PRIMARY KEY,
  sevkiyat_no INTEGER UNIQUE NOT NULL,
  irsaliye_no VARCHAR(100),
  gonderim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  gelis_tarihi TIMESTAMP,
  durum VARCHAR(20) DEFAULT 'gonderildi', -- 'gonderildi', 'geldi', 'tamamlandi'
  notlar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sevkiyat Ürünleri Tablosu (Giden ve Gelen)
CREATE TABLE IF NOT EXISTS sevkiyat_urunler (
  id SERIAL PRIMARY KEY,
  sevkiyat_id INTEGER REFERENCES temizleme_sevkiyat(id) ON DELETE CASCADE,
  urun_kodu VARCHAR(100) NOT NULL,
  parca_tipi VARCHAR(1), -- A, B, C, D

  -- Giden Bilgileri
  giden_adet INTEGER NOT NULL,
  giden_kg DECIMAL(10,3),
  gonderim_tarihi TIMESTAMP,

  -- Gelen Bilgileri
  gelen_adet INTEGER,
  gelen_kg DECIMAL(10,3),
  gelis_tarihi TIMESTAMP,

  -- Kalite Kontrol
  pis_adet INTEGER DEFAULT 0,
  pis_kg DECIMAL(10,3) DEFAULT 0,

  -- Mükerrer Bilgileri
  is_mukerrer BOOLEAN DEFAULT FALSE,
  kaynak_sevkiyat_id INTEGER REFERENCES temizleme_sevkiyat(id),
  kaynak_urun_id INTEGER REFERENCES sevkiyat_urunler(id),

  notlar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sevkiyat numarası için sequence oluştur
CREATE SEQUENCE IF NOT EXISTS sevkiyat_no_seq START 1;

-- 4. İndeksler
CREATE INDEX IF NOT EXISTS idx_sevkiyat_no ON temizleme_sevkiyat(sevkiyat_no);
CREATE INDEX IF NOT EXISTS idx_sevkiyat_durum ON temizleme_sevkiyat(durum);
CREATE INDEX IF NOT EXISTS idx_sevkiyat_urunler_sevkiyat ON sevkiyat_urunler(sevkiyat_id);
CREATE INDEX IF NOT EXISTS idx_sevkiyat_urunler_kod ON sevkiyat_urunler(urun_kodu);
CREATE INDEX IF NOT EXISTS idx_sevkiyat_urunler_mukerrer ON sevkiyat_urunler(is_mukerrer);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sevkiyat_updated_at BEFORE UPDATE ON temizleme_sevkiyat
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sevkiyat_urunler_updated_at BEFORE UPDATE ON sevkiyat_urunler
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. View: Sevkiyat Özeti
CREATE OR REPLACE VIEW v_sevkiyat_ozet AS
SELECT
  s.id,
  s.sevkiyat_no,
  s.irsaliye_no,
  s.gonderim_tarihi,
  s.gelis_tarihi,
  s.durum,
  COUNT(su.id) as toplam_urun_cesidi,
  SUM(su.giden_adet) as toplam_giden_adet,
  SUM(su.giden_kg) as toplam_giden_kg,
  SUM(su.gelen_adet) as toplam_gelen_adet,
  SUM(su.gelen_kg) as toplam_gelen_kg,
  SUM(CASE WHEN su.is_mukerrer THEN su.giden_kg ELSE 0 END) as toplam_mukerrer_kg,
  SUM(CASE WHEN NOT su.is_mukerrer THEN su.giden_kg ELSE 0 END) as odenecek_kg
FROM temizleme_sevkiyat s
LEFT JOIN sevkiyat_urunler su ON s.id = su.sevkiyat_id
GROUP BY s.id, s.sevkiyat_no, s.irsaliye_no, s.gonderim_tarihi, s.gelis_tarihi, s.durum;

COMMENT ON TABLE temizleme_sevkiyat IS 'Temizlemeye gönderilen sevkiyatların ana tablosu';
COMMENT ON TABLE sevkiyat_urunler IS 'Sevkiyatlardaki ürünlerin detay bilgileri';
COMMENT ON VIEW v_sevkiyat_ozet IS 'Sevkiyatların özet bilgileri ve ödeme hesaplamaları';
