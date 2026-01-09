-- İç Siparişler Tablosuna "Siparişi Veren Yer" Kolonu Ekleme
-- Tarih: 2026-01-09
-- Açıklama: Ürün siparişlerinde siparişi veren yeri takip etmek için yeni alan

-- 1. Yeni kolonu ekle
ALTER TABLE urun_siparisler
ADD COLUMN IF NOT EXISTS siparis_veren_yer VARCHAR(255);

-- 2. Kontrol sorgusu - Yeni kolonun eklendiğini doğrula
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'urun_siparisler'
ORDER BY ordinal_position;
