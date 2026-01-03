-- Update Ürün Ağırlıkları with REAL product and fitting data from Excel
-- Clear existing incorrect data
TRUNCATE TABLE urun_agirliklari_master CASCADE;
TRUNCATE TABLE urun_agirliklari_fittinglar CASCADE;

-- Insert actual Joint (Ürün Cinsi) products from Excel file
-- Note: "-" values converted to 0.000 for NULL handling
INSERT INTO urun_agirliklari_master (urun_kodu, agirlik_a, agirlik_b, agirlik_c, agirlik_d) VALUES
('2512', 0.676, 0.181, 0.000, 0.000),
('2815', 1.120, 0.318, 0.000, 0.000),
('730A YEŞİL', 0.484, 0.392, 0.000, 0.000),
('1509', 0.379, 0.153, 0.000, 0.000),
('335A GRİ', 0.387, 0.085, 0.000, 0.000),
('335A YEŞİL', 0.427, 0.087, 0.000, 0.000),
('KHRO22M', 0.410, 0.090, 0.000, 0.000),
('1350A', 1.054, 0.000, 0.000, 0.000),
('FQ04NA', 0.000, 0.000, 0.149, 0.000),
('HZG20B', 0.893, 0.000, 0.000, 0.000),
('DIS180', 0.525, 0.212, 0.000, 0.000),
('DIS 22', 0.319, 0.122, 0.000, 0.000),
('DIS371', 0.973, 0.290, 0.000, 0.000),
('506A YEŞİL', 0.484, 0.101, 0.000, 0.000),
('CMY-Y102SS-G2 TR', 0.155, 0.029, 0.035, 0.011);

-- Insert actual Fittings data from Excel file
INSERT INTO urun_agirliklari_fittinglar (tip, boyut, agirlik) VALUES
-- Dirsek (Elbow)
('Dirsek', '54mm', 0.312),
('Dirsek', '42mm', 0.181),
('Dirsek', '35mm', 0.105),
('Dirsek', '28mm', 0.063),
('Dirsek', '22mm', 0.039),
('Dirsek 45 Derece', '28mm', 0.055),
-- TEE
('TEE', '35mm', 0.176),
('TEE', '22mm', 0.067),
('TEE', '19mm', 0.049),
('TEE', '15.88mm', 0.035),
('TEE', '12.7mm', 0.0218);

-- Verify data
SELECT COUNT(*) as "Ürün Sayısı" FROM urun_agirliklari_master;
SELECT COUNT(*) as "Fitting Sayısı" FROM urun_agirliklari_fittinglar;

-- Show all products
SELECT * FROM urun_agirliklari_master ORDER BY id;

-- Show all fittings
SELECT * FROM urun_agirliklari_fittinglar ORDER BY tip, boyut;
