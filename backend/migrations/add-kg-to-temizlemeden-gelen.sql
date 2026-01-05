-- Add kg column to surec_temizlemeden_gelen if it doesn't exist
-- This fixes the "column kg does not exist" error

ALTER TABLE surec_temizlemeden_gelen
ADD COLUMN IF NOT EXISTS kg NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE surec_temizlemeden_gelen
ADD COLUMN IF NOT EXISTS parti_id INTEGER;

ALTER TABLE surec_temizlemeden_gelen
ADD COLUMN IF NOT EXISTS kalite_kontrol_durum VARCHAR(50);

-- Success message will be logged by the migration runner
