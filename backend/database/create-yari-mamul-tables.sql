-- Yarı Mamül Jointler Tablosu
CREATE TABLE IF NOT EXISTS yari_mamul_jointler (
    id SERIAL PRIMARY KEY,
    urun VARCHAR(255) NOT NULL UNIQUE,
    a_adet INTEGER DEFAULT 0,
    b_adet INTEGER DEFAULT 0,
    c_adet INTEGER DEFAULT 0,
    d_adet INTEGER DEFAULT 0,
    kg NUMERIC(10, 3) DEFAULT 0,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yarı Mamül Jointler Log Tablosu
CREATE TABLE IF NOT EXISTS yari_mamul_jointler_log (
    id SERIAL PRIMARY KEY,
    islem_tipi VARCHAR(50) NOT NULL, -- 'ekleme', 'guncelleme', 'silme'
    yapan VARCHAR(100) NOT NULL,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eski_veri JSONB,
    yeni_veri JSONB,
    aciklama TEXT
);

-- Yarı Mamül Fittingsler Tablosu
CREATE TABLE IF NOT EXISTS yari_mamul_fittingsler (
    id SERIAL PRIMARY KEY,
    urun VARCHAR(255) NOT NULL UNIQUE,
    adet INTEGER DEFAULT 0,
    kg NUMERIC(10, 3) DEFAULT 0,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yarı Mamül Fittingsler Log Tablosu
CREATE TABLE IF NOT EXISTS yari_mamul_fittingsler_log (
    id SERIAL PRIMARY KEY,
    islem_tipi VARCHAR(50) NOT NULL, -- 'ekleme', 'guncelleme', 'silme'
    yapan VARCHAR(100) NOT NULL,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eski_veri JSONB,
    yeni_veri JSONB,
    aciklama TEXT
);

-- Trigger fonksiyonu: Jointler güncelleme tarihi
CREATE OR REPLACE FUNCTION update_jointler_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jointler_timestamp
BEFORE UPDATE ON yari_mamul_jointler
FOR EACH ROW
EXECUTE FUNCTION update_jointler_timestamp();

-- Trigger fonksiyonu: Fittingsler güncelleme tarihi
CREATE OR REPLACE FUNCTION update_fittingsler_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fittingsler_timestamp
BEFORE UPDATE ON yari_mamul_fittingsler
FOR EACH ROW
EXECUTE FUNCTION update_fittingsler_timestamp();
