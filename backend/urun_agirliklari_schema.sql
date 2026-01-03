-- Ürün Ağırlıkları Module Database Schema
-- Created: 2026-01-02
-- Purpose: Product weights, fittings weights, and calculation tracking

-- Drop existing tables if they exist
DROP TABLE IF EXISTS urun_agirliklari_hesaplamalar CASCADE;
DROP TABLE IF EXISTS urun_agirliklari_fittinglar CASCADE;
DROP TABLE IF EXISTS urun_agirliklari_master CASCADE;

-- Table 1: Master Product Weights Table
-- Stores 15 products with A, B, C, D quality weight categories
CREATE TABLE urun_agirliklari_master (
    id SERIAL PRIMARY KEY,
    urun_kodu VARCHAR(50) UNIQUE NOT NULL,
    agirlik_a DECIMAL(10,3) NOT NULL,  -- A quality weight in kg
    agirlik_b DECIMAL(10,3) NOT NULL,  -- B quality weight in kg
    agirlik_c DECIMAL(10,3) NOT NULL,  -- C quality weight in kg
    agirlik_d DECIMAL(10,3) NOT NULL,  -- D quality weight in kg
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Fittings Weights Table
-- Stores 11 fitting types (Dirsek and TEE) with sizes and weights
CREATE TABLE urun_agirliklari_fittinglar (
    id SERIAL PRIMARY KEY,
    tip VARCHAR(50) NOT NULL,          -- "Dirsek" or "TEE"
    boyut VARCHAR(50) NOT NULL,        -- Size: "19", "25", "32", "40", "50", "63", "75", "90", "110", "125", "160"
    agirlik DECIMAL(10,3) NOT NULL,    -- Weight in kg
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tip, boyut)
);

-- Table 3: Calculations History Table
-- Tracks all weight calculations performed by users
CREATE TABLE urun_agirliklari_hesaplamalar (
    id SERIAL PRIMARY KEY,
    hesaplama_tipi VARCHAR(50) NOT NULL,  -- "Ürün", "Fitting", "A+B Toplam", "Toplu"
    urun_kodu VARCHAR(100),                -- Product or fitting name
    kalite VARCHAR(10),                    -- "A", "B", "C", "D" (for products only)
    adet INTEGER NOT NULL,                 -- Quantity
    birim_agirlik DECIMAL(10,3) NOT NULL,  -- Unit weight in kg
    toplam_agirlik DECIMAL(10,3) NOT NULL, -- Total weight in kg
    batch_id VARCHAR(50),                  -- Groups batch calculations together (Feature 4)
    batch_detay TEXT,                      -- JSON string with batch details (Feature 4)
    yapan VARCHAR(100),                    -- Who performed the calculation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_urun_agirliklari_master_updated_at
    BEFORE UPDATE ON urun_agirliklari_master
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urun_agirliklari_fittinglar_updated_at
    BEFORE UPDATE ON urun_agirliklari_fittinglar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_hesaplamalar_created_at ON urun_agirliklari_hesaplamalar(created_at DESC);
CREATE INDEX idx_hesaplamalar_batch_id ON urun_agirliklari_hesaplamalar(batch_id);
CREATE INDEX idx_hesaplamalar_tipi ON urun_agirliklari_hesaplamalar(hesaplama_tipi);
CREATE INDEX idx_master_urun_kodu ON urun_agirliklari_master(urun_kodu);
CREATE INDEX idx_fittinglar_tip_boyut ON urun_agirliklari_fittinglar(tip, boyut);

-- Insert Initial Data: 15 Products
INSERT INTO urun_agirliklari_master (urun_kodu, agirlik_a, agirlik_b, agirlik_c, agirlik_d) VALUES
('18 EQUAL TEE', 4.850, 5.650, 6.950, 9.350),
('19 EQUAL TEE', 5.700, 6.150, 8.200, 11.050),
('25 EQUAL TEE', 9.550, 11.000, 13.500, 18.200),
('32 EQUAL TEE', 17.650, 20.400, 25.050, 33.700),
('40 EQUAL TEE', 32.200, 37.200, 45.700, 61.450),
('50 EQUAL TEE', 57.350, 66.250, 81.400, 109.500),
('63 EQUAL TEE', 106.300, 122.800, 150.850, 202.950),
('75 EQUAL TEE', 178.400, 206.150, 253.300, 340.700),
('90 EQUAL TEE', 309.550, 357.650, 439.550, 591.400),
('110 EQUAL TEE', 532.450, 615.150, 756.050, 1017.150),
('125 EQUAL TEE', 756.700, 874.300, 1074.900, 1446.400),
('160 EQUAL TEE', 1558.600, 1800.950, 2213.750, 2978.500),
('200 EQUAL TEE', 2963.200, 3424.000, 4208.850, 5663.650),
('250 EQUAL TEE', 5638.450, 6514.900, 8007.950, 10774.550),
('315 EQUAL TEE', 10875.700, 12570.150, 15452.900, 20791.100);

-- Insert Initial Data: 11 Fittings
INSERT INTO urun_agirliklari_fittinglar (tip, boyut, agirlik) VALUES
('Dirsek', '19', 1.550),
('Dirsek', '25', 2.650),
('Dirsek', '32', 4.900),
('Dirsek', '40', 8.950),
('Dirsek', '50', 15.950),
('Dirsek', '63', 29.550),
('TEE', '19', 2.200),
('TEE', '25', 3.750),
('TEE', '32', 6.950),
('TEE', '40', 12.700),
('TEE', '50', 22.600);

-- Verification queries
SELECT 'Products inserted:' as info, COUNT(*) as count FROM urun_agirliklari_master;
SELECT 'Fittings inserted:' as info, COUNT(*) as count FROM urun_agirliklari_fittinglar;

COMMENT ON TABLE urun_agirliklari_master IS 'Master table for product weights with A, B, C, D quality categories';
COMMENT ON TABLE urun_agirliklari_fittinglar IS 'Fittings (Dirsek and TEE) weights table';
COMMENT ON TABLE urun_agirliklari_hesaplamalar IS 'History of all weight calculations performed';
