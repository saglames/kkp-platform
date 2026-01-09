-- Sipariş Hazırlığı Tablosuna Yeni Alanlar Ekleme
-- Tarih: 2026-01-09
-- Açıklama: Eksik malzeme, hazır malzeme adetleri ve tarih alanları ekleniyor

-- 1. Eksik Malzeme Adetleri Sütunları Ekle
ALTER TABLE siparis_hazirlik
ADD COLUMN IF NOT EXISTS eksik_koli INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS eksik_kutu INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS eksik_izolasyon INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS eksik_tapa INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS eksik_poset INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS eksik_ek_parca INTEGER DEFAULT 0;

-- 2. Hazır Malzeme Adetleri Sütunları Ekle
ALTER TABLE siparis_hazirlik
ADD COLUMN IF NOT EXISTS hazir_koli INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hazir_kutu INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hazir_izolasyon INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hazir_ek_parca INTEGER DEFAULT 0;

-- 3. Tarih Sütunları Ekle (tamamlanma_tarihi nullable - tamamlandığında girilecek)
ALTER TABLE siparis_hazirlik
ADD COLUMN IF NOT EXISTS siparis_tarihi DATE,
ADD COLUMN IF NOT EXISTS tamamlanma_tarihi DATE;

-- 4. Mevcut 'tarih' alanını siparis_tarihi'ye kopyala (eğer boşsa)
UPDATE siparis_hazirlik
SET siparis_tarihi = tarih
WHERE siparis_tarihi IS NULL;

-- 5. Tamamlanmış siparişler için tamamlanma tarihini oluşturma tarihinden al
UPDATE siparis_hazirlik
SET tamamlanma_tarihi = son_guncelleme::date
WHERE durum = 'tamamlandi' AND tamamlanma_tarihi IS NULL;

-- 6. Eski boolean malzeme alanlarını yorum satırına alma
-- NOT: Bu alanları şimdilik silmiyoruz, eski veriler kaybolmasın
-- Eğer veri kontrolü yapıldıktan sonra silinmek istenirse şu komutlar kullanılabilir:
-- ALTER TABLE siparis_hazirlik DROP COLUMN IF EXISTS malzeme_koli;
-- ALTER TABLE siparis_hazirlik DROP COLUMN IF EXISTS malzeme_kutu;
-- ALTER TABLE siparis_hazirlik DROP COLUMN IF EXISTS malzeme_izolasyon;
-- ALTER TABLE siparis_hazirlik DROP COLUMN IF EXISTS malzeme_tapa;
-- ALTER TABLE siparis_hazirlik DROP COLUMN IF EXISTS malzeme_poset;

-- 7. Yeni alanlar için index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_siparis_siparis_tarihi ON siparis_hazirlik(siparis_tarihi);
CREATE INDEX IF NOT EXISTS idx_siparis_tamamlanma_tarihi ON siparis_hazirlik(tamamlanma_tarihi);

-- 8. Kontrol sorgusu - Yeni sütunların eklendiğini doğrula
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'siparis_hazirlik'
ORDER BY ordinal_position;
