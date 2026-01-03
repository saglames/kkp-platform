-- Schema Migration: Add missing columns to Render database
-- This adds columns that exist in local but not in Render

-- Add missing columns to gorevler
ALTER TABLE gorevler ADD COLUMN IF NOT EXISTS baslama_tarihi date;
ALTER TABLE gorevler ADD COLUMN IF NOT EXISTS bitis_tarihi date;

-- Create missing tables if they don't exist

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
