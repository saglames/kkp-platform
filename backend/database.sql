-- K.K.P. Platform - PostgreSQL Veritabanı Şeması
-- Oluşturulma Tarihi: 29.12.2025

-- Veritabanını oluştur
CREATE DATABASE kkp_db;

-- Kullanıcılar Tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategori Enum
CREATE TYPE category_type AS ENUM ('izolasyon', 'koli', 'kutu', 'tapa', 'poset', 'etiket');

-- Mamül Stok - İzolasyon Tablosu
CREATE TABLE mamul_izolasyon (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    kullanilan_urunler TEXT[], -- Array olarak saklayacağız
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mamül Stok - Koli Tablosu
CREATE TABLE mamul_koli (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dimensions VARCHAR(100), -- örn: "65.5*38*41"
    icine_giren_urunler TEXT, -- örn: "2815(10)- DIS 371(16)"
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mamül Stok - Kutu Tablosu
CREATE TABLE mamul_kutu (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dimensions VARCHAR(100),
    icine_giren_urun TEXT, -- örn: "DIS-22-1GAT 1 set"
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mamül Stok - Tapa Tablosu
CREATE TABLE mamul_tapa (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mamül Stok - İşlem Geçmişi
CREATE TABLE mamul_history (
    id SERIAL PRIMARY KEY,
    category category_type NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'Eklendi' veya 'Çıkarıldı'
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    old_stock INTEGER,
    new_stock INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kalite Kontrol - Görevler
CREATE TABLE gorevler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    aciklama TEXT,
    aciliyet VARCHAR(20) DEFAULT 'normal', -- 'acil', 'normal', 'dusuk'
    atanan VARCHAR(100),
    tamamlandi BOOLEAN DEFAULT FALSE,
    sira INTEGER,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kalite Kontrol - Görev Notları
CREATE TABLE gorev_notlar (
    id SERIAL PRIMARY KEY,
    gorev_id INTEGER REFERENCES gorevler(id) ON DELETE CASCADE,
    ekleyen VARCHAR(100),
    metin TEXT NOT NULL,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kalite Kontrol - Sipariş Hazırlığı
CREATE TABLE siparis_hazirlik (
    id SERIAL PRIMARY KEY,
    tarih DATE NOT NULL,
    operator VARCHAR(100) NOT NULL,
    siparis_no VARCHAR(100) NOT NULL,
    urun_kodu VARCHAR(255) NOT NULL,
    siparis_adet INTEGER NOT NULL,
    gonderilen_adet INTEGER DEFAULT 0,
    durum VARCHAR(50) DEFAULT 'beklemede', -- 'beklemede', 'hazirlanıyor', 'tamamlandi'
    malzeme_koli BOOLEAN DEFAULT FALSE,
    malzeme_kutu BOOLEAN DEFAULT FALSE,
    malzeme_izolasyon BOOLEAN DEFAULT FALSE,
    malzeme_tapa BOOLEAN DEFAULT FALSE,
    malzeme_poset BOOLEAN DEFAULT FALSE,
    notlar TEXT,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kalite Kontrol - Sipariş Gönderimleri (Gönderim Takip)
CREATE TABLE siparis_gonderimler (
    id SERIAL PRIMARY KEY,
    siparis_id INTEGER REFERENCES siparis_hazirlik(id) ON DELETE CASCADE,
    gonderen VARCHAR(100) NOT NULL,
    gonderilen_adet INTEGER NOT NULL,
    gonderim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notlar TEXT
);

-- Kalite Kontrol - Ürün Siparişleri
CREATE TABLE urun_siparisler (
    id SERIAL PRIMARY KEY,
    urun_adi VARCHAR(255) NOT NULL,
    adet_miktar VARCHAR(100),
    olcu VARCHAR(100),
    talep_eden VARCHAR(100),
    aciklama TEXT,
    durum VARCHAR(50) DEFAULT 'bekleniyor', -- 'bekleniyor', 'geldi', 'iptal'
    gelen_adet VARCHAR(100),
    gelen_notlar TEXT,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gelis_tarihi TIMESTAMP
);

-- Kalite Kontrol - Simülasyon Stok
CREATE TABLE simulasyon_stok (
    id SERIAL PRIMARY KEY,
    malzeme_turu category_type NOT NULL,
    urun_adi VARCHAR(255) NOT NULL,
    olculeri VARCHAR(255),
    mevcut_adet INTEGER DEFAULT 0,
    ekleyen VARCHAR(100),
    son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ürün Tanımları (Joint, İzolasyon bilgileri için)
CREATE TABLE urun_tanimlari (
    id SERIAL PRIMARY KEY,
    urun_kodu VARCHAR(255) UNIQUE NOT NULL,
    urun_adi VARCHAR(255) NOT NULL,
    kategori VARCHAR(50), -- 'joint', 'izolasyon', 'diger'
    kutu_kodu VARCHAR(50),
    koli_kodu VARCHAR(50),
    izolasyon_kodu VARCHAR(255),
    tapa_boyutu VARCHAR(50),
    izolasyonsuz BOOLEAN DEFAULT FALSE,
    aciklama TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcıları ekle
INSERT INTO users (name) VALUES
    ('Esat'),
    ('Melisa'),
    ('Evrim'),
    ('Koray'),
    ('Emre'),
    ('Ahmet');

-- Ürün Tanımları - Joint Ürünler
INSERT INTO urun_tanimlari (urun_kodu, urun_adi, kategori, kutu_kodu, koli_kodu, izolasyonsuz, aciklama) VALUES
    ('DIS-180-1GAT', 'DIS-180-1GAT', 'joint', 'K3', 'B2', TRUE, 'Koliye 20 kutu sığıyor'),
    ('DIS-22-1GAT', 'DIS-22-1GAT', 'joint', 'K1', 'B1', TRUE, 'Koliye 35 kutu sığıyor'),
    ('DIS-371-2GAT', 'DIS-371-2GAT', 'joint', 'K10', 'B8', TRUE, 'Koliye 16 kutu sığıyor');

-- Ürün Tanımları - FQ Serisi (İzolasyon henüz belli değil)
INSERT INTO urun_tanimlari (urun_kodu, urun_adi, kategori, kutu_kodu, koli_kodu, izolasyonsuz) VALUES
    ('FQ01A/AA-ISL', 'FQ01A/AA-ISL', 'diger', 'K4', 'B3', FALSE),
    ('FQ01B/AA-ISL', 'FQ01B/AA-ISL', 'diger', 'K4', 'B3', FALSE),
    ('FQ02/AA-ISL', 'FQ02/AA-ISL', 'diger', 'K5', 'B4', FALSE);

-- Index'ler (Performans için)
CREATE INDEX idx_mamul_izolasyon_name ON mamul_izolasyon(name);
CREATE INDEX idx_mamul_history_category ON mamul_history(category);
CREATE INDEX idx_mamul_history_created ON mamul_history(created_at DESC);
CREATE INDEX idx_gorevler_tamamlandi ON gorevler(tamamlandi);
CREATE INDEX idx_siparis_hazirlik_durum ON siparis_hazirlik(durum);
CREATE INDEX idx_urun_siparisler_durum ON urun_siparisler(durum);
CREATE INDEX idx_simulasyon_stok_malzeme ON simulasyon_stok(malzeme_turu);

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mamul_izolasyon_updated_at BEFORE UPDATE ON mamul_izolasyon FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mamul_koli_updated_at BEFORE UPDATE ON mamul_koli FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mamul_kutu_updated_at BEFORE UPDATE ON mamul_kutu FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mamul_tapa_updated_at BEFORE UPDATE ON mamul_tapa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gorevler_updated_at BEFORE UPDATE ON gorevler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_siparis_hazirlik_updated_at BEFORE UPDATE ON siparis_hazirlik FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulasyon_stok_updated_at BEFORE UPDATE ON simulasyon_stok FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
