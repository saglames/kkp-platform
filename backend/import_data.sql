-- Sample data import for K.K.P. Platform
-- This file contains only INSERT statements for initial data

-- Users
INSERT INTO users (name) VALUES
    ('Esat'),
    ('Melisa'),
    ('Evrim'),
    ('Koray'),
    ('Emre'),
    ('Ahmet')
ON CONFLICT DO NOTHING;

-- Ürün Tanımları - Joint Ürünler
INSERT INTO urun_tanimlari (urun_kodu, urun_adi, kategori, kutu_kodu, koli_kodu, izolasyonsuz, aciklama) VALUES
    ('DIS-180-1GAT', 'DIS-180-1GAT', 'joint', 'K3', 'B2', TRUE, 'Koliye 20 kutu sığıyor'),
    ('DIS-22-1GAT', 'DIS-22-1GAT', 'joint', 'K1', 'B1', TRUE, 'Koliye 35 kutu sığıyor'),
    ('DIS-371-2GAT', 'DIS-371-2GAT', 'joint', 'K10', 'B8', TRUE, 'Koliye 16 kutu sığıyor')
ON CONFLICT DO NOTHING;

-- Ürün Tanımları - FQ Serisi
INSERT INTO urun_tanimlari (urun_kodu, urun_adi, kategori, kutu_kodu, koli_kodu, izolasyonsuz) VALUES
    ('FQ01A/AA-ISL', 'FQ01A/AA-ISL', 'diger', 'K4', 'B3', FALSE),
    ('FQ01B/AA-ISL', 'FQ01B/AA-ISL', 'diger', 'K4', 'B3', FALSE),
    ('FQ02/AA-ISL', 'FQ02/AA-ISL', 'diger', 'K5', 'B4', FALSE)
ON CONFLICT DO NOTHING;

-- Mamul Stok - İzolasyon
INSERT INTO mamul_izolasyon (name, kullanilan_urunler, stock) VALUES
    ('İzolasyon 1', ARRAY['DIS-180-1GAT', 'DIS-22-1GAT'], 150),
    ('İzolasyon 2', ARRAY['DIS-371-2GAT'], 200),
    ('İzolasyon 3', ARRAY['FQ01A/AA-ISL', 'FQ01B/AA-ISL'], 100)
ON CONFLICT DO NOTHING;

-- Mamul Stok - Koli
INSERT INTO mamul_koli (name, dimensions, icine_giren_urunler, stock) VALUES
    ('B1', '50*30*40', 'DIS-22-1GAT (35 adet)', 80),
    ('B2', '55*35*42', 'DIS-180-1GAT (20 adet)', 60),
    ('B3', '48*32*38', 'FQ01A/AA-ISL (25 adet)', 45),
    ('B4', '52*34*40', 'FQ02/AA-ISL (30 adet)', 70),
    ('B8', '65*38*41', 'DIS-371-2GAT (16 adet)', 50)
ON CONFLICT DO NOTHING;

-- Mamul Stok - Kutu
INSERT INTO mamul_kutu (name, dimensions, icine_giren_urun, stock) VALUES
    ('K1', '15*10*8', 'DIS-22-1GAT 1 set', 120),
    ('K3', '18*12*10', 'DIS-180-1GAT 1 set', 90),
    ('K4', '16*11*9', 'FQ01A/AA-ISL 1 set', 110),
    ('K5', '17*11*9', 'FQ02/AA-ISL 1 set', 85),
    ('K10', '20*14*11', 'DIS-371-2GAT 1 set', 75)
ON CONFLICT DO NOTHING;

-- Mamul Stok - Tapa
INSERT INTO mamul_tapa (name, stock) VALUES
    ('Tapa 22mm', 500),
    ('Tapa 25mm', 400),
    ('Tapa 32mm', 350),
    ('Tapa 40mm', 300),
    ('Tapa 50mm', 250)
ON CONFLICT DO NOTHING;
