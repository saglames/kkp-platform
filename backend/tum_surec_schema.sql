-- TÜM SÜREÇ MODÜLÜ - Veritabanı Şeması
-- Excel: "son surec.xlsm" sisteminin web versiyonu

-- 1. ÜRÜN MASTER TABLOSU
CREATE TABLE surec_urunler (
    id SERIAL PRIMARY KEY,
    tip VARCHAR(10) NOT NULL, -- 'A' veya 'B' (kalite sınıfı)
    urun_kodu VARCHAR(255) NOT NULL UNIQUE,
    urun_kodu_base VARCHAR(255) NOT NULL, -- "MXJ-YA2512M/R" (tip olmadan)
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(urun_kodu)
);

-- 2. TEMİZLEMEYE GİDECEK (İlk Aşama)
CREATE TABLE surec_temizlemeye_gidecek (
    id SERIAL PRIMARY KEY,
    urun_id INTEGER REFERENCES surec_urunler(id) ON DELETE CASCADE,
    adet INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    UNIQUE(urun_id)
);

-- 3. TEMİZLEMEDE OLAN (İkinci Aşama)
CREATE TABLE surec_temizlemede_olan (
    id SERIAL PRIMARY KEY,
    urun_id INTEGER REFERENCES surec_urunler(id) ON DELETE CASCADE,
    adet INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    UNIQUE(urun_id)
);

-- 4. TEMİZLEMEDEN GELEN (Üçüncü Aşama)
CREATE TABLE surec_temizlemeden_gelen (
    id SERIAL PRIMARY KEY,
    urun_id INTEGER REFERENCES surec_urunler(id) ON DELETE CASCADE,
    kg DECIMAL(10,2) DEFAULT 0,
    adet INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    UNIQUE(urun_id)
);

-- 5. SEVKE HAZIR (Base ürün kodu ile - A ve B birlikte)
CREATE TABLE surec_sevke_hazir (
    id SERIAL PRIMARY KEY,
    urun_kodu_base VARCHAR(255) NOT NULL UNIQUE, -- "MXJ-YA2512M/R"
    adet INTEGER DEFAULT 0,
    koli_sayisi INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

-- 6. KALAN (Tapalı Bekleyen - Notlar için)
CREATE TABLE surec_kalan (
    id SERIAL PRIMARY KEY,
    urun_id INTEGER REFERENCES surec_urunler(id) ON DELETE CASCADE,
    adet INTEGER DEFAULT 0,
    notlar TEXT,
    tapali_bekleyen_notlar TEXT, -- "115Ad. Tapalı bekliyor."
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    UNIQUE(urun_id)
);

-- 7. SEVK EDİLEN (Geçmiş Kayıtlar)
CREATE TABLE surec_sevk_edilen (
    id SERIAL PRIMARY KEY,
    tip VARCHAR(50) DEFAULT 'Joint', -- Ürün tipi
    urun_kodu_base VARCHAR(255) NOT NULL, -- "MXJ-YA2512M/R"
    tarih DATE NOT NULL,
    adet INTEGER NOT NULL,
    gonderildigi_yer VARCHAR(255), -- "Fabrika Kamyonet", "Malatya" vs.
    irsaliye_numarasi VARCHAR(100),
    notlar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

-- 8. HAREKET GEÇMİŞİ (Tüm transfer işlemleri)
CREATE TABLE surec_hareket_log (
    id SERIAL PRIMARY KEY,
    urun_id INTEGER REFERENCES surec_urunler(id) ON DELETE CASCADE,
    islem_tipi VARCHAR(50) NOT NULL, -- 'temizlemeye_gonder', 'temizlemeye_al', 'temizlemeden_getir', 'sevke_hazirla', 'sevk_et'
    kaynak VARCHAR(50), -- Nereden geldi
    hedef VARCHAR(50), -- Nereye gitti
    adet INTEGER NOT NULL,
    kg DECIMAL(10,2),
    yapan VARCHAR(100),
    notlar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ANASAYFA VIEW (Excel'deki Anasayfa gibi - tüm verileri birleştir)
CREATE OR REPLACE VIEW surec_anasayfa AS
SELECT
    u.id,
    u.tip,
    u.urun_kodu,
    u.urun_kodu_base,
    COALESCE(tg.adet, 0) as temizlemeye_gidecek,
    COALESCE(to2.adet, 0) as temizlemede_olan,
    COALESCE(tgelen.adet, 0) as temizlemeden_gelen,
    COALESCE(sh.adet, 0) as sevke_hazir,
    COALESCE(k.adet, 0) as kalan,
    COALESCE(
        (SELECT SUM(se.adet)
         FROM surec_sevk_edilen se
         WHERE se.urun_kodu_base = u.urun_kodu_base),
        0
    ) as sevk_edilen_toplam,
    k.notlar,
    k.tapali_bekleyen_notlar,
    u.aktif
FROM surec_urunler u
LEFT JOIN surec_temizlemeye_gidecek tg ON u.id = tg.urun_id
LEFT JOIN surec_temizlemede_olan to2 ON u.id = to2.urun_id
LEFT JOIN surec_temizlemeden_gelen tgelen ON u.id = tgelen.urun_id
LEFT JOIN surec_sevke_hazir sh ON u.urun_kodu_base = sh.urun_kodu_base
LEFT JOIN surec_kalan k ON u.id = k.urun_id
WHERE u.aktif = TRUE
ORDER BY u.urun_kodu;

-- İndeksler (Performans için)
CREATE INDEX idx_surec_urunler_base ON surec_urunler(urun_kodu_base);
CREATE INDEX idx_surec_sevk_tarih ON surec_sevk_edilen(tarih DESC);
CREATE INDEX idx_surec_hareket_tarih ON surec_hareket_log(created_at DESC);
CREATE INDEX idx_surec_hareket_urun ON surec_hareket_log(urun_id);

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_surec_temizlemeye_gidecek_updated_at BEFORE UPDATE ON surec_temizlemeye_gidecek FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surec_temizlemede_olan_updated_at BEFORE UPDATE ON surec_temizlemede_olan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surec_temizlemeden_gelen_updated_at BEFORE UPDATE ON surec_temizlemeden_gelen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surec_sevke_hazir_updated_at BEFORE UPDATE ON surec_sevke_hazir FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surec_kalan_updated_at BEFORE UPDATE ON surec_kalan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ÖRNEK VERİ (Excel'den)
INSERT INTO surec_urunler (tip, urun_kodu, urun_kodu_base) VALUES
('A', 'MXJ-YA2512M/R (A)', 'MXJ-YA2512M/R'),
('B', 'MXJ-YA2512M/R (B)', 'MXJ-YA2512M/R'),
('A', 'DIS-371-2GAT (A)', 'DIS-371-2GAT'),
('B', 'DIS-371-2GAT (B)', 'DIS-371-2GAT'),
('A', 'DIS-180-1GAT (A)', 'DIS-180-1GAT'),
('B', 'DIS-180-1GAT (B)', 'DIS-180-1GAT'),
('A', 'DIS-22-1GAT (A)', 'DIS-22-1GAT'),
('B', 'DIS-22-1GAT (B)', 'DIS-22-1GAT');

-- Başlangıç verileri (Excel'den alınan değerler)
INSERT INTO surec_temizlemeye_gidecek (urun_id, adet)
SELECT id, CASE
    WHEN urun_kodu = 'MXJ-YA2512M/R (A)' THEN 2712
    WHEN urun_kodu = 'MXJ-YA2512M/R (B)' THEN 2630
    WHEN urun_kodu = 'DIS-371-2GAT (A)' THEN 1932
    WHEN urun_kodu = 'DIS-371-2GAT (B)' THEN 379
    ELSE 0
END
FROM surec_urunler;

INSERT INTO surec_temizlemeden_gelen (urun_id, kg, adet)
SELECT id,
    CASE WHEN urun_kodu = 'MXJ-YA2512M/R (B)' THEN 322.66 ELSE 0 END,
    0
FROM surec_urunler;

COMMENT ON TABLE surec_urunler IS 'Tüm Süreç - Master ürün listesi (A/B kalite sınıfları ile)';
COMMENT ON TABLE surec_temizlemeye_gidecek IS 'Malatya''ya temizlemeye gönderilecek ürünler';
COMMENT ON TABLE surec_temizlemede_olan IS 'Şu anda temizleme sürecinde olan ürünler';
COMMENT ON TABLE surec_temizlemeden_gelen IS 'Temizlemeden dönen ürünler (KG ve Adet)';
COMMENT ON TABLE surec_sevke_hazir IS 'Müşteriye sevke hazır ürünler (A+B birleşik)';
COMMENT ON TABLE surec_kalan IS 'Temizlemeden gelip henüz sevke hazır olmayan ürünler';
COMMENT ON TABLE surec_sevk_edilen IS 'Sevk edilmiş ürün geçmişi (irsaliye ile)';
COMMENT ON TABLE surec_hareket_log IS 'Tüm süreç hareketlerinin log kaydı';
