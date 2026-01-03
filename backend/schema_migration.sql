-- Schema Migration: Add missing columns to Render database
-- This adds columns that exist in local but not in Render

-- Add missing columns to gorevler
ALTER TABLE gorevler ADD COLUMN IF NOT EXISTS baslama_tarihi date;
ALTER TABLE gorevler ADD COLUMN IF NOT EXISTS bitis_tarihi date;

-- Create missing log tables

-- siparis_degisiklik_log
CREATE TABLE IF NOT EXISTS siparis_degisiklik_log (
    id SERIAL PRIMARY KEY,
    siparis_id integer,
    degistiren character varying(100),
    degisiklik_turu character varying(50) NOT NULL,
    eski_deger text,
    yeni_deger text,
    aciklama text,
    tarih timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- urun_siparis_degisiklik_log
CREATE TABLE IF NOT EXISTS urun_siparis_degisiklik_log (
    id SERIAL PRIMARY KEY,
    siparis_id integer,
    degistiren character varying(100),
    degisiklik_turu character varying(50) NOT NULL,
    eski_deger text,
    yeni_deger text,
    aciklama text,
    tarih timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create missing surec tables if they don't exist

-- surec_temizlemeye_gidecek
CREATE TABLE IF NOT EXISTS surec_temizlemeye_gidecek (
    id SERIAL PRIMARY KEY,
    urun_id integer,
    adet integer DEFAULT 0,
    notlar text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100)
);

-- surec_temizlemede_olan
CREATE TABLE IF NOT EXISTS surec_temizlemede_olan (
    id SERIAL PRIMARY KEY,
    urun_id integer,
    kg numeric,
    durum character varying(50) DEFAULT 'Beklemede',
    notlar text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100)
);

-- surec_temizlemeden_gelen
CREATE TABLE IF NOT EXISTS surec_temizlemeden_gelen (
    id SERIAL PRIMARY KEY,
    urun_id integer,
    adet integer DEFAULT 0,
    kullanim_durumu character varying(50) DEFAULT 'Kullanabilir',
    notlar text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100)
);

-- surec_sevke_hazir
CREATE TABLE IF NOT EXISTS surec_sevke_hazir (
    id SERIAL PRIMARY KEY,
    urun_kodu_base character varying(255) NOT NULL,
    adet integer DEFAULT 0,
    koli_sayisi integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100)
);

-- surec_sevk_edilen
CREATE TABLE IF NOT EXISTS surec_sevk_edilen (
    id SERIAL PRIMARY KEY,
    tip character varying(50) DEFAULT 'Joint',
    urun_kodu_base character varying(255) NOT NULL,
    tarih date NOT NULL,
    adet integer NOT NULL,
    gonderildigi_yer character varying(255),
    irsaliye_numarasi character varying(100),
    notlar text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(100)
);

-- surec_kalan
CREATE TABLE IF NOT EXISTS surec_kalan (
    id SERIAL PRIMARY KEY,
    urun_id integer,
    adet integer DEFAULT 0,
    notlar text,
    tapali_bekleyen_notlar text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(100)
);

-- surec_hareket_log
CREATE TABLE IF NOT EXISTS surec_hareket_log (
    id SERIAL PRIMARY KEY,
    urun_id integer,
    islem_tipi character varying(50) NOT NULL,
    kaynak character varying(50),
    hedef character varying(50),
    adet integer NOT NULL,
    kg numeric,
    yapan character varying(100),
    notlar text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- surec_urunler
CREATE TABLE IF NOT EXISTS surec_urunler (
    id SERIAL PRIMARY KEY,
    tip character varying(10) NOT NULL,
    urun_kodu character varying(255) NOT NULL,
    urun_kodu_base character varying(255) NOT NULL,
    aktif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- urun_recetesi
CREATE TABLE IF NOT EXISTS urun_recetesi (
    id SERIAL PRIMARY KEY,
    urun_kodu character varying(100) NOT NULL,
    urun_adi character varying(255) NOT NULL,
    aciklama text,
    koli_tipi character varying(50),
    koli_kapasitesi integer DEFAULT 1,
    kutu_tipi character varying(50),
    olusturma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- recete_malzemeler
CREATE TABLE IF NOT EXISTS recete_malzemeler (
    id SERIAL PRIMARY KEY,
    urun_id integer,
    malzeme_tipi character varying(50) NOT NULL,
    malzeme_kodu character varying(100) NOT NULL,
    malzeme_adi character varying(255),
    adet integer DEFAULT 1 NOT NULL,
    birim character varying(20) DEFAULT 'adet',
    kategori character varying(50),
    notlar text,
    olusturma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- kesim_olculeri
CREATE TABLE IF NOT EXISTS kesim_olculeri (
    id SERIAL PRIMARY KEY,
    model character varying(100) NOT NULL,
    alt_grup character varying(50),
    parca character varying(50),
    dis_cap numeric,
    et_kalinligi numeric,
    uzunluk integer,
    genisletme numeric,
    punch character varying(100),
    birim_agirlik numeric,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- urun_agirliklari_master
CREATE TABLE IF NOT EXISTS urun_agirliklari_master (
    id SERIAL PRIMARY KEY,
    urun_kodu character varying(50) NOT NULL,
    agirlik_a numeric NOT NULL,
    agirlik_b numeric NOT NULL,
    agirlik_c numeric NOT NULL,
    agirlik_d numeric NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- urun_agirliklari_fittinglar
CREATE TABLE IF NOT EXISTS urun_agirliklari_fittinglar (
    id SERIAL PRIMARY KEY,
    tip character varying(50) NOT NULL,
    boyut character varying(50) NOT NULL,
    agirlik numeric NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- urun_agirliklari_hesaplamalar
CREATE TABLE IF NOT EXISTS urun_agirliklari_hesaplamalar (
    id SERIAL PRIMARY KEY,
    hesaplama_tipi character varying(50) NOT NULL,
    urun_kodu character varying(100),
    kalite character varying(10),
    adet integer NOT NULL,
    birim_agirlik numeric NOT NULL,
    toplam_agirlik numeric NOT NULL,
    batch_id character varying(50),
    batch_detay text,
    yapan character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
