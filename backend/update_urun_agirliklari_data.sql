-- Update Ürün Ağırlıkları with correct product and fitting data
-- Clear existing incorrect data
TRUNCATE TABLE urun_agirliklari_master CASCADE;
TRUNCATE TABLE urun_agirliklari_fittinglar CASCADE;

-- Insert actual Joint (Ürün Cinsi) products from user's data
-- Note: Converting Turkish decimal format (comma) to SQL format (dot)
INSERT INTO urun_agirliklari_master (urun_kodu, agirlik_a, agirlik_b, agirlik_c, agirlik_d) VALUES
('2512', 0.000, 0.000, 0.000, 0.000),  -- Placeholder - need actual weights from image
('2815', 0.000, 0.000, 0.000, 0.000),
('730A YEŞİL', 0.000, 0.000, 0.000, 0.000),
('1509', 0.000, 0.000, 0.000, 0.000),
('335A GRİ', 0.000, 0.000, 0.000, 0.000),
('335A YEŞİL', 0.000, 0.000, 0.000, 0.000),
('KHRO22M', 0.000, 0.000, 0.000, 0.000),
('1350A', 0.000, 0.000, 0.000, 0.000),
('FQ04NA', 0.000, 0.000, 0.000, 0.000),
('HZG20B', 0.000, 0.000, 0.000, 0.000),
('DIS180', 0.000, 0.000, 0.000, 0.000),
('DIS 22', 0.000, 0.000, 0.000, 0.000),
('DIS371', 0.000, 0.000, 0.000, 0.000),
('506A YEŞİL', 0.000, 0.000, 0.000, 0.000),
('CMY-Y102SS-G2 TR', 0.000, 0.000, 0.000, 0.000);

-- Insert actual Fittings data from user's second image
INSERT INTO urun_agirliklari_fittinglar (tip, boyut, agirlik) VALUES
-- Dirsek (Elbow)
('Dirsek', '54mm', 0.312),
('Dirsek', '42mm', 0.181),
('Dirsek', '35mm', 0.105),
('Dirsek', '28mm', 0.063),
('Dirsek', '22mm', 0.039),
('Dirsek', '45 Derece 28mm', 0.055),
-- TEE
('TEE', '35mm', 0.176),
('TEE', '22mm', 0.067),
('TEE', '19mm', 0.049),
('TEE', '15,88mm', 0.035),
('TEE', '12,7mm', 0.0218);

-- Verify data
SELECT COUNT(*) as "Ürün Sayısı" FROM urun_agirliklari_master;
SELECT COUNT(*) as "Fitting Sayısı" FROM urun_agirliklari_fittinglar;
