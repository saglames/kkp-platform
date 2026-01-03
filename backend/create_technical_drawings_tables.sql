-- Teknik Resimler (Technical Drawings) Modülü için veritabanı tabloları

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS teknik_resimler_kategoriler (
  id SERIAL PRIMARY KEY,
  kategori_adi VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PDF dosyaları tablosu
CREATE TABLE IF NOT EXISTS teknik_resimler_dosyalar (
  id SERIAL PRIMARY KEY,
  kategori_id INTEGER REFERENCES teknik_resimler_kategoriler(id) ON DELETE CASCADE,
  dosya_adi VARCHAR(255) NOT NULL,
  dosya_yolu VARCHAR(500) NOT NULL,
  dosya_boyutu INTEGER, -- bytes
  yukleyen VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı girişleri log tablosu
CREATE TABLE IF NOT EXISTS teknik_resimler_login_log (
  id SERIAL PRIMARY KEY,
  kullanici_adi VARCHAR(100),
  basarili BOOLEAN,
  ip_adresi VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Varsayılan kategorileri ekle
INSERT INTO teknik_resimler_kategoriler (kategori_adi) VALUES
  ('Panasonic Teknik Resimleri'),
  ('Mitsubishi Teknik Resimleri'),
  ('TLC Teknik Resimleri'),
  ('Teknosa Teknik Resimleri'),
  ('Daikin Teknik Resimleri'),
  ('Samsung Teknik Resimleri'),
  ('Diğer Teknik Resimler')
ON CONFLICT (kategori_adi) DO NOTHING;

-- İndeks oluştur
CREATE INDEX IF NOT EXISTS idx_teknik_dosyalar_kategori ON teknik_resimler_dosyalar(kategori_id);
CREATE INDEX IF NOT EXISTS idx_teknik_login_kullanici ON teknik_resimler_login_log(kullanici_adi);
