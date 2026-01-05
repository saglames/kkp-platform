-- Add problemli (problematic) columns to sevkiyat_urunler table
-- These track products that couldn't be cleaned properly

ALTER TABLE sevkiyat_urunler
ADD COLUMN IF NOT EXISTS problemli_adet INTEGER DEFAULT 0;

ALTER TABLE sevkiyat_urunler
ADD COLUMN IF NOT EXISTS problemli_kg NUMERIC(10, 2) DEFAULT 0;

-- Add calculated column comment for reference
COMMENT ON COLUMN sevkiyat_urunler.problemli_adet IS 'Temizleme problemi olan ürün adedi (manuel giriş)';
COMMENT ON COLUMN sevkiyat_urunler.problemli_kg IS 'Temizleme problemi olan ürün kg (manuel giriş)';
