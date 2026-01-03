-- Update product names to match the new naming convention
-- Clear and re-insert with correct names

TRUNCATE TABLE urun_agirliklari_master CASCADE;

-- Insert with corrected product names from the image
INSERT INTO urun_agirliklari_master (urun_kodu, agirlik_a, agirlik_b, agirlik_c, agirlik_d) VALUES
('MXJ-YA2512M/R', 0.676, 0.181, 0.000, 0.000),
('DIS-371-2GAT', 0.973, 0.290, 0.000, 0.000),
('DIS-180-1GAT', 0.525, 0.212, 0.000, 0.000),
('DIS-22-1GAT', 0.319, 0.122, 0.000, 0.000),
('KHRQ22M20T', 0.410, 0.090, 0.000, 0.000),
('FQG-335A', 0.387, 0.085, 0.000, 0.000),
('FQG-335A-Y', 0.427, 0.087, 0.000, 0.000),
('FQG-B506A-Y', 0.484, 0.101, 0.000, 0.000),
('FQG-B730A-Y', 0.484, 0.392, 0.000, 0.000),
('MXJ-YA1509M-R1', 0.379, 0.153, 0.000, 0.000),
('MXJ-YA2815M/R', 1.120, 0.318, 0.000, 0.000),
('CMY-Y102SS-TR', 0.155, 0.029, 0.035, 0.011),
('FQG-04NaA', 0.000, 0.000, 0.149, 0.000),
('HZG-30B', 0.893, 0.000, 0.000, 0.000),
('HZG-20B', 0.893, 0.000, 0.000, 0.000),
('FQG-B1350A', 1.054, 0.000, 0.000, 0.000),
('FQG-B506 GRİ', 0.387, 0.085, 0.000, 0.000),
('FQG-B730 GRİ', 0.484, 0.392, 0.000, 0.000),
('FQ01B/A', 0.319, 0.122, 0.000, 0.000);

-- Verify
SELECT COUNT(*) as "Joint Sayısı" FROM urun_agirliklari_master;
SELECT urun_kodu FROM urun_agirliklari_master ORDER BY id;
