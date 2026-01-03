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
