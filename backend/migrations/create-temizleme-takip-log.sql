-- Temizleme Takip İşlem Logları Tablosu
CREATE TABLE IF NOT EXISTS temizleme_takip_log (
    id SERIAL PRIMARY KEY,
    sevkiyat_id INTEGER REFERENCES temizleme_sevkiyat(id) ON DELETE CASCADE,
    urun_id INTEGER REFERENCES sevkiyat_urunler(id) ON DELETE CASCADE,
    islem_tipi VARCHAR(50) NOT NULL, -- 'sevkiyat_olustur', 'sevkiyat_guncelle', 'sevkiyat_sil', 'urun_guncelle', 'gelen_kaydet'
    eski_deger JSONB, -- Değişiklik öncesi değer
    yeni_deger JSONB, -- Değişiklik sonrası değer
    yapan VARCHAR(100) NOT NULL,
    aciklama TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index'ler
CREATE INDEX idx_temizleme_log_sevkiyat ON temizleme_takip_log(sevkiyat_id);
CREATE INDEX idx_temizleme_log_urun ON temizleme_takip_log(urun_id);
CREATE INDEX idx_temizleme_log_created ON temizleme_takip_log(created_at DESC);
