-- Simülasyon Stok Tablosundan Duplicate Kayıtları Silme
-- Tarih: 2026-01-09
-- Açıklama: Aynı malzeme_turu ve urun_adi ile birden fazla kayıt varsa, en son güncellenen hariç diğerlerini sil

-- 1. Duplicate kayıtları kontrol et
SELECT
    malzeme_turu,
    urun_adi,
    COUNT(*) as kayit_sayisi,
    STRING_AGG(id::text, ', ' ORDER BY son_guncelleme DESC) as id_listesi
FROM simulasyon_stok
GROUP BY malzeme_turu, urun_adi
HAVING COUNT(*) > 1
ORDER BY malzeme_turu, urun_adi;

-- 2. Duplicate kayıtları sil (en son güncellenen kayıt hariç)
WITH duplicates AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY malzeme_turu, urun_adi
            ORDER BY son_guncelleme DESC, id DESC
        ) as rn
    FROM simulasyon_stok
)
DELETE FROM simulasyon_stok
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Kontrol: Hala duplicate var mı?
SELECT
    malzeme_turu,
    urun_adi,
    COUNT(*) as kayit_sayisi
FROM simulasyon_stok
GROUP BY malzeme_turu, urun_adi
HAVING COUNT(*) > 1;

-- 4. Unique constraint ekle (gelecekte duplicate oluşmasını önlemek için)
ALTER TABLE simulasyon_stok
ADD CONSTRAINT simulasyon_stok_unique_product
UNIQUE (malzeme_turu, urun_adi);
