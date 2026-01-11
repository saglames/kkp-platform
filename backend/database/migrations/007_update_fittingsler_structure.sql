-- Migration: Update Fittingsler table structure to match Excel format
-- Version: 007
-- Description: Change fittingsler structure to have ebat_kod, urun_tipi, adet, kg columns

-- Drop old table and recreate with new structure
DROP TABLE IF EXISTS yari_mamul_fittingsler CASCADE;

CREATE TABLE yari_mamul_fittingsler (
    id SERIAL PRIMARY KEY,
    ebat_kod VARCHAR(255) NOT NULL,
    urun_tipi VARCHAR(255) NOT NULL,
    adet INTEGER DEFAULT 0,
    kg NUMERIC(10, 3) DEFAULT 0,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ebat_kod, urun_tipi)
);

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_update_fittingsler_timestamp ON yari_mamul_fittingsler;
CREATE TRIGGER trigger_update_fittingsler_timestamp
BEFORE UPDATE ON yari_mamul_fittingsler
FOR EACH ROW
EXECUTE FUNCTION update_fittingsler_timestamp();
