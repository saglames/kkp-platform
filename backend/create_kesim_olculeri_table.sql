-- Kesim Ölçüleri Tablosu
CREATE TABLE IF NOT EXISTS kesim_olculeri (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    alt_grup VARCHAR(50),
    parca VARCHAR(50),
    dis_cap DECIMAL(10,2),
    et_kalinligi DECIMAL(10,2),
    uzunluk INTEGER,
    genisletme DECIMAL(10,2),
    punch VARCHAR(100),
    birim_agirlik DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_kesim_olculeri_model ON kesim_olculeri(model);
CREATE INDEX IF NOT EXISTS idx_kesim_olculeri_alt_grup ON kesim_olculeri(alt_grup);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_kesim_olculeri_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kesim_olculeri_updated_at
    BEFORE UPDATE ON kesim_olculeri
    FOR EACH ROW
    EXECUTE FUNCTION update_kesim_olculeri_timestamp();
