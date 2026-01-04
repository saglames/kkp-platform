# Database Schema Documentation

**Version:** 1.0
**Last Updated:** 2026-01-04

## Table of Contents

1. [Overview](#overview)
2. [ER Diagram Description](#er-diagram-description)
3. [Table Definitions](#table-definitions)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Constraints](#constraints)
7. [Generated Columns](#generated-columns)
8. [Migration](#migration)

## Overview

The Temizleme Takip database schema consists of 6 main tables and integrates with 4 existing tables from the Tüm Süreç system.

### Main Tables (6)

1. **temizleme_partiler** - Batch master data
2. **temizleme_parti_urunler** - Products in each batch
3. **temizleme_kalite_kontrol_log** - Quality control history
4. **temizleme_fiyatlandirma** - Pricing configuration
5. **temizleme_odeme_log** - Payment transactions
6. **hatali_urunler** - Defective products (shared/extended table)

### Integration Tables (4)

- **surec_urunler** - Product master data
- **surec_temizlemede_olan** - Products currently in cleaning
- **surec_temizlemeden_gelen** - Products returned from cleaning
- **surec_hareket_log** - Movement history

## ER Diagram Description

```
┌─────────────────────┐
│  surec_urunler      │
│  ─────────────────  │
│  id (PK)            │
│  urun_kodu          │
│  urun_kodu_base     │
│  tip                │
│  birim_agirlik      │
└──────────┬──────────┘
           │
           │ 1:N
           ↓
┌─────────────────────────────┐        ┌──────────────────────────┐
│  temizleme_partiler         │        │  temizleme_fiyatlandirma │
│  ───────────────────────    │        │  ────────────────────────│
│  id (PK)                    │        │  id (PK)                 │
│  parti_no (UNIQUE)          │        │  urun_id (FK)            │
│  irsaliye_no                │        │  kg_birim_fiyat          │
│  gidis_tarihi               │        │  adet_birim_fiyat        │
│  gidis_kg                   │        │  fiyat_tipi              │
│  gidis_adet                 │        │  aktif                   │
│  gidis_notlar               │        │  gecerlilik_baslangic    │
│  donus_tarihi               │        │  gecerlilik_bitis        │
│  donus_kg                   │        └──────────────────────────┘
│  donus_adet                 │
│  donus_notlar               │
│  kg_farki (GENERATED)       │
│  adet_farki (GENERATED)     │
│  durum                      │
│  kalite_durum               │
│  kalite_kontrol_tarihi      │
│  kalite_kontrol_yapan       │
│  tekrar_temizlik_sayisi     │
│  ana_parti_id (FK self)     │
│  odeme_durumu               │
│  odenen_tutar               │
│  kalan_borc                 │
│  birim_fiyat_kg             │
│  birim_fiyat_adet           │
│  odenecek_tutar             │
└──────┬──────────────────────┘
       │
       │ 1:N
       ↓
┌─────────────────────────────┐
│  temizleme_parti_urunler    │
│  ───────────────────────    │
│  id (PK)                    │
│  parti_id (FK)              │
│  urun_id (FK)               │
│  gidis_adet                 │
│  gidis_kg                   │
│  donus_adet                 │
│  donus_kg                   │
│  adet_farki (GENERATED)     │
│  kg_farki (GENERATED)       │
│  hata_adet                  │
│  hata_detay (JSONB)         │
│  odenecek_adet              │
│  odenecek_kg                │
│  odenmeyecek_adet           │
│  odenmeyecek_kg             │
└─────────────────────────────┘
       │
       │ 1:N
       ↓
┌──────────────────────────────────┐
│  temizleme_kalite_kontrol_log    │
│  ────────────────────────────    │
│  id (PK)                         │
│  parti_id (FK)                   │
│  karar                           │
│  karar_veren                     │
│  karar_tarihi                    │
│  kontrol_edilen_adet             │
│  hata_tespit_edilen_adet         │
│  hata_orani                      │
│  aciklama                        │
│  problem_kategorileri (JSONB)    │
└──────────────────────────────────┘

┌──────────────────────────┐
│  temizleme_odeme_log     │
│  ────────────────────    │
│  id (PK)                 │
│  parti_id (FK)           │
│  odeme_tipi              │
│  odeme_tutari            │
│  odeme_tarihi            │
│  odeme_yontemi           │
│  aciklama                │
└──────────────────────────┘

┌──────────────────────────┐
│  hatali_urunler          │
│  ────────────────────    │
│  id (PK)                 │
│  parti_no                │
│  urun_kodu               │
│  temizleme_parti_id (FK) │
│  kaynak                  │
│  [12 defect columns]     │
└──────────────────────────┘
```

## Table Definitions

### 1. temizleme_partiler

Master table for cleaning batches.

```sql
CREATE TABLE temizleme_partiler (
    id integer PRIMARY KEY,
    parti_no varchar(100) UNIQUE NOT NULL,
    irsaliye_no varchar(100),
    gidis_tarihi date NOT NULL,
    gidis_kg numeric(10,2) DEFAULT 0,
    gidis_adet integer DEFAULT 0,
    gidis_notlar text,
    donus_tarihi date,
    donus_kg numeric(10,2) DEFAULT 0,
    donus_adet integer DEFAULT 0,
    donus_notlar text,
    kg_farki numeric(10,2) GENERATED ALWAYS AS (donus_kg - gidis_kg) STORED,
    adet_farki integer GENERATED ALWAYS AS (donus_adet - gidis_adet) STORED,
    durum varchar(50) DEFAULT 'gonderildi',
    kalite_durum varchar(50),
    kalite_kontrol_tarihi timestamp,
    kalite_kontrol_yapan varchar(100),
    kalite_notlar text,
    tekrar_temizlik_sayisi integer DEFAULT 0,
    ana_parti_id integer REFERENCES temizleme_partiler(id),
    odeme_durumu varchar(50) DEFAULT 'odenecek',
    odenen_tutar numeric(10,2) DEFAULT 0,
    kalan_borc numeric(10,2) DEFAULT 0,
    birim_fiyat_kg numeric(10,2),
    birim_fiyat_adet numeric(10,2),
    odenecek_tutar numeric(10,2),
    created_by varchar(100),
    updated_by varchar(100),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| parti_no | varchar(100) | Unique batch number (e.g., P-2024-001) |
| irsaliye_no | varchar(100) | Waybill/invoice number (optional) |
| gidis_tarihi | date | Departure date (when sent for cleaning) |
| gidis_kg | numeric(10,2) | Total weight sent (kg) |
| gidis_adet | integer | Total quantity sent (pieces) |
| gidis_notlar | text | Notes for departure |
| donus_tarihi | date | Return date (when received back) |
| donus_kg | numeric(10,2) | Total weight returned (kg) |
| donus_adet | integer | Total quantity returned (pieces) |
| donus_notlar | text | Notes for return |
| kg_farki | numeric(10,2) | **GENERATED**: donus_kg - gidis_kg |
| adet_farki | integer | **GENERATED**: donus_adet - gidis_adet |
| durum | varchar(50) | Status: gonderildi, kalite_kontrol, kabul, red, tekrar_temizlik |
| kalite_durum | varchar(50) | Quality control decision |
| kalite_kontrol_tarihi | timestamp | When QC was performed |
| kalite_kontrol_yapan | varchar(100) | Who performed QC |
| kalite_notlar | text | QC notes |
| tekrar_temizlik_sayisi | integer | Number of times re-cleaned |
| ana_parti_id | integer | If re-cleaned, references original batch |
| odeme_durumu | varchar(50) | Payment status: odenecek, kismen_odendi, odendi |
| odenen_tutar | numeric(10,2) | Amount paid |
| kalan_borc | numeric(10,2) | Remaining debt |
| birim_fiyat_kg | numeric(10,2) | Pricing snapshot (per kg) |
| birim_fiyat_adet | numeric(10,2) | Pricing snapshot (per piece) |
| odenecek_tutar | numeric(10,2) | Total amount to be paid |
| created_by | varchar(100) | Who created the batch |
| updated_by | varchar(100) | Who last updated |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### Status Flow (durum)

```
gonderildi → kalite_kontrol → [kabul | red | tekrar_temizlik]
                                  ↓      ↓           ↓
                             Sevke Hazır  End    New Batch
```

---

### 2. temizleme_parti_urunler

Products within each batch (many-to-many relationship).

```sql
CREATE TABLE temizleme_parti_urunler (
    id integer PRIMARY KEY,
    parti_id integer NOT NULL REFERENCES temizleme_partiler(id) ON DELETE CASCADE,
    urun_id integer NOT NULL REFERENCES surec_urunler(id),
    gidis_adet integer DEFAULT 0,
    gidis_kg numeric(10,2) DEFAULT 0,
    donus_adet integer DEFAULT 0,
    donus_kg numeric(10,2) DEFAULT 0,
    adet_farki integer GENERATED ALWAYS AS (donus_adet - gidis_adet) STORED,
    kg_farki numeric(10,2) GENERATED ALWAYS AS (donus_kg - gidis_kg) STORED,
    hata_adet integer DEFAULT 0,
    hata_detay jsonb,
    odenecek_adet integer,
    odenecek_kg numeric(10,2),
    odenmeyecek_adet integer,
    odenmeyecek_kg numeric(10,2),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| parti_id | integer | Foreign key to temizleme_partiler |
| urun_id | integer | Foreign key to surec_urunler |
| gidis_adet | integer | Quantity sent for this product |
| gidis_kg | numeric | Weight sent for this product |
| donus_adet | integer | Quantity returned |
| donus_kg | numeric | Weight returned |
| adet_farki | integer | **GENERATED**: donus_adet - gidis_adet |
| kg_farki | numeric | **GENERATED**: donus_kg - gidis_kg |
| hata_adet | integer | Total defects found |
| hata_detay | jsonb | Defect breakdown by category |
| odenecek_adet | integer | Quantity to be paid for |
| odenecek_kg | numeric | Weight to be paid for |
| odenmeyecek_adet | integer | Defective quantity (not paid) |
| odenmeyecek_kg | numeric | Defective weight (not paid) |

#### hata_detay JSONB Structure

```json
{
  "temizleme_problemi": 5,
  "vuruk_problem": 3,
  "polisaj": 2,
  "kaynak_az": 1
}
```

---

### 3. temizleme_kalite_kontrol_log

Quality control inspection history.

```sql
CREATE TABLE temizleme_kalite_kontrol_log (
    id integer PRIMARY KEY,
    parti_id integer NOT NULL REFERENCES temizleme_partiler(id),
    karar varchar(50) NOT NULL,
    karar_veren varchar(100),
    karar_tarihi timestamp DEFAULT CURRENT_TIMESTAMP,
    kontrol_edilen_adet integer DEFAULT 0,
    hata_tespit_edilen_adet integer DEFAULT 0,
    hata_orani numeric(5,2) DEFAULT 0,
    aciklama text,
    problem_kategorileri jsonb,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| parti_id | integer | Foreign key to temizleme_partiler |
| karar | varchar(50) | Decision: kabul, red, tekrar_temizlik |
| karar_veren | varchar(100) | Inspector name |
| karar_tarihi | timestamp | Decision timestamp |
| kontrol_edilen_adet | integer | Number of pieces inspected |
| hata_tespit_edilen_adet | integer | Number of defects found |
| hata_orani | numeric(5,2) | Error rate % = (defects/inspected)*100 |
| aciklama | text | Inspection notes |
| problem_kategorileri | jsonb | List of problem descriptions |

---

### 4. temizleme_fiyatlandirma

Pricing configuration (versioned).

```sql
CREATE TABLE temizleme_fiyatlandirma (
    id integer PRIMARY KEY,
    urun_tipi varchar(50) DEFAULT 'genel',
    birim_fiyat_kg numeric(10,2) DEFAULT 0,
    birim_fiyat_adet numeric(10,2) DEFAULT 0,
    aktif boolean DEFAULT true,
    gecerli_tarih_baslangic date DEFAULT CURRENT_DATE,
    gecerli_tarih_bitis date,
    notlar text,
    created_by varchar(100),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| urun_tipi | varchar(50) | Product type (usually 'genel' for all) |
| birim_fiyat_kg | numeric | Price per kilogram |
| birim_fiyat_adet | numeric | Price per piece |
| aktif | boolean | Is this pricing currently active? |
| gecerli_tarih_baslangic | date | Effective from date |
| gecerli_tarih_bitis | date | Effective until date (null = indefinite) |

**Note:** Only one pricing can be active at a time per `urun_tipi`.

---

### 5. temizleme_odeme_log

Payment transaction history.

```sql
CREATE TABLE temizleme_odeme_log (
    id integer PRIMARY KEY,
    parti_id integer NOT NULL REFERENCES temizleme_partiler(id),
    odeme_tipi varchar(50),
    odeme_tutari numeric(10,2) NOT NULL,
    odeme_tarihi timestamp DEFAULT CURRENT_TIMESTAMP,
    odeme_yontemi varchar(100),
    aciklama text,
    created_by varchar(100),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| parti_id | integer | Foreign key to temizleme_partiler |
| odeme_tipi | varchar(50) | Payment type: tam (full), kismen (partial) |
| odeme_tutari | numeric | Payment amount |
| odeme_tarihi | timestamp | Payment date |
| odeme_yontemi | varchar | Payment method (e.g., "Banka Transferi") |
| aciklama | text | Payment notes |

---

### 6. hatali_urunler

Defective products tracking (shared table with other systems).

**Note:** This table is extended with Temizleme Takip specific columns.

```sql
CREATE TABLE hatali_urunler (
    id integer PRIMARY KEY,
    parti_no varchar(100) NOT NULL,
    urun_kodu varchar(100) NOT NULL,
    temizleme_parti_id integer REFERENCES temizleme_partiler(id),
    kaynak varchar(50) DEFAULT 'kalite_kontrol',
    temizleme_problemi integer DEFAULT 0,
    vuruk_problem integer DEFAULT 0,
    capagi_alinmayan integer DEFAULT 0,
    polisaj integer DEFAULT 0,
    kaynak_az integer DEFAULT 0,
    kaynak_akintisi integer DEFAULT 0,
    ici_capakli integer DEFAULT 0,
    pim_girmeyen integer DEFAULT 0,
    boncuklu integer DEFAULT 0,
    yamuk integer DEFAULT 0,
    gramaji_dusuk integer DEFAULT 0,
    hurda integer DEFAULT 0,
    guncelleme_tarihi timestamp DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parti_no, urun_kodu)
);
```

#### Defect Categories

| Column | Description (Turkish) | Description (English) |
|--------|----------------------|----------------------|
| temizleme_problemi | Temizleme Hatalı | Cleaning issue |
| vuruk_problem | Vuruk | Dent/deformation |
| capagi_alinmayan | Kapağı Alınmayan | Cap not removed |
| polisaj | Polisaj | Polishing issue |
| kaynak_az | Kaynak Az | Insufficient welding |
| kaynak_akintisi | Kaynak Akıntısı | Welding leak |
| ici_capakli | İçi Çapaklı | Internal burr |
| pim_girmeyen | Pim Girmeyen | Pin won't fit |
| boncuklu | Boncuklu | Beaded |
| yamuk | Yamuk | Crooked |
| gramaji_dusuk | Gramajı Düşük | Low weight/mass |
| hurda | Hurda | Scrap/unusable |

---

## Relationships

### Foreign Keys

```sql
-- Self-referencing for re-cleaning batches
ALTER TABLE temizleme_partiler
  ADD CONSTRAINT fk_parti_ana_parti
  FOREIGN KEY (ana_parti_id) REFERENCES temizleme_partiler(id);

-- Batch products
ALTER TABLE temizleme_parti_urunler
  ADD CONSTRAINT fk_parti_urunler_parti
  FOREIGN KEY (parti_id) REFERENCES temizleme_partiler(id) ON DELETE CASCADE;

ALTER TABLE temizleme_parti_urunler
  ADD CONSTRAINT fk_parti_urunler_urun
  FOREIGN KEY (urun_id) REFERENCES surec_urunler(id);

-- Quality control
ALTER TABLE temizleme_kalite_kontrol_log
  ADD CONSTRAINT fk_kalite_kontrol_parti
  FOREIGN KEY (parti_id) REFERENCES temizleme_partiler(id);

-- Pricing
ALTER TABLE temizleme_fiyatlandirma
  ADD CONSTRAINT fk_fiyatlandirma_urun
  FOREIGN KEY (urun_id) REFERENCES surec_urunler(id);

-- Payment
ALTER TABLE temizleme_odeme_log
  ADD CONSTRAINT fk_odeme_log_parti
  FOREIGN KEY (parti_id) REFERENCES temizleme_partiler(id);

-- Defects
ALTER TABLE hatali_urunler
  ADD CONSTRAINT fk_hatali_urunler_parti
  FOREIGN KEY (temizleme_parti_id) REFERENCES temizleme_partiler(id);
```

### Cascade Behavior

- **temizleme_parti_urunler**: `ON DELETE CASCADE` - If batch is deleted, all products are deleted
- All other FKs: Default (RESTRICT) - Cannot delete if referenced

---

## Indexes

Performance indexes for common queries:

```sql
-- Batch lookups
CREATE INDEX idx_temizleme_partiler_parti_no ON temizleme_partiler(parti_no);
CREATE INDEX idx_temizleme_partiler_durum ON temizleme_partiler(durum);
CREATE INDEX idx_temizleme_partiler_gidis_tarihi ON temizleme_partiler(gidis_tarihi);

-- Product lookups
CREATE INDEX idx_temizleme_parti_urunler_parti_id ON temizleme_parti_urunler(parti_id);
CREATE INDEX idx_temizleme_parti_urunler_urun_id ON temizleme_parti_urunler(urun_id);

-- Quality control
CREATE INDEX idx_temizleme_kalite_kontrol_parti_id ON temizleme_kalite_kontrol_log(parti_id);

-- Defects
CREATE INDEX idx_hatali_urunler_temizleme_parti_id ON hatali_urunler(temizleme_parti_id);

-- Integration tables
CREATE INDEX idx_surec_temizlemede_olan_parti_id ON surec_temizlemede_olan(parti_id);
CREATE INDEX idx_surec_temizlemeden_gelen_parti_id ON surec_temizlemeden_gelen(parti_id);
```

---

## Constraints

### Unique Constraints

```sql
-- Only one batch with same number
ALTER TABLE temizleme_partiler ADD CONSTRAINT uq_parti_no UNIQUE (parti_no);

-- Only one defect record per batch-product combination
ALTER TABLE hatali_urunler ADD CONSTRAINT uq_parti_urun UNIQUE (parti_no, urun_kodu);
```

### Check Constraints

Currently no check constraints, but recommended additions:

```sql
-- Ensure quantities are non-negative
ALTER TABLE temizleme_partiler ADD CHECK (gidis_adet >= 0);
ALTER TABLE temizleme_partiler ADD CHECK (donus_adet >= 0);
ALTER TABLE temizleme_partiler ADD CHECK (gidis_kg >= 0);
ALTER TABLE temizleme_partiler ADD CHECK (donus_kg >= 0);

-- Ensure valid status
ALTER TABLE temizleme_partiler ADD CHECK (
  durum IN ('gonderildi', 'kalite_kontrol', 'kabul', 'red', 'tekrar_temizlik')
);

-- Ensure valid payment status
ALTER TABLE temizleme_partiler ADD CHECK (
  odeme_durumu IN ('odenecek', 'kismen_odendi', 'odendi')
);

-- Error rate between 0-100%
ALTER TABLE temizleme_kalite_kontrol_log ADD CHECK (hata_orani >= 0 AND hata_orani <= 100);
```

---

## Generated Columns

The schema uses PostgreSQL's `GENERATED ALWAYS AS ... STORED` feature for calculated fields:

### temizleme_partiler

```sql
kg_farki numeric(10,2) GENERATED ALWAYS AS (donus_kg - gidis_kg) STORED
adet_farki integer GENERATED ALWAYS AS (donus_adet - gidis_adet) STORED
```

### temizleme_parti_urunler

```sql
adet_farki integer GENERATED ALWAYS AS (donus_adet - gidis_adet) STORED
kg_farki numeric(10,2) GENERATED ALWAYS AS (donus_kg - gidis_kg) STORED
```

**Benefits:**
- Always accurate (automatically calculated)
- Queryable and indexable
- No application logic needed
- Storage efficient (STORED, not computed on-the-fly)

**Note:** You cannot INSERT or UPDATE generated columns directly.

---

## Migration

### Initial Setup

Run the migration script:

```bash
node backend/migrate-temizleme-schema.js
```

### What the Migration Does

1. **Adds columns to existing tables:**
   - `hatali_urunler`: `temizleme_parti_id`, `kaynak`
   - `surec_hareket_log`: `parti_id`, `parti_no`, `gidis_kg`, `donus_kg`
   - `surec_temizlemede_olan`: `parti_id`, `gidis_kg`
   - `surec_temizlemeden_gelen`: `parti_id`, `kalite_kontrol_durum`

2. **Creates new tables:**
   - `temizleme_partiler`
   - `temizleme_parti_urunler`
   - `temizleme_kalite_kontrol_log`
   - `temizleme_fiyatlandirma`
   - `temizleme_odeme_log`

3. **Creates foreign key constraints**

4. **Creates indexes**

### Rollback

To rollback (use with caution):

```sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS temizleme_odeme_log;
DROP TABLE IF EXISTS temizleme_kalite_kontrol_log;
DROP TABLE IF EXISTS temizleme_parti_urunler;
DROP TABLE IF EXISTS temizleme_fiyatlandirma;
DROP TABLE IF EXISTS temizleme_partiler;

-- Remove added columns
ALTER TABLE hatali_urunler DROP COLUMN IF EXISTS temizleme_parti_id;
ALTER TABLE hatali_urunler DROP COLUMN IF EXISTS kaynak;
-- etc.
```

---

## Data Integrity Best Practices

1. **Always use transactions** for multi-table operations
2. **Validate status transitions** before updates
3. **Use foreign keys** to maintain referential integrity
4. **Leverage generated columns** instead of application-side calculations
5. **Create indexes** for frequently queried columns
6. **Add check constraints** for business rules
7. **Regular backups** before batch operations

---

## Performance Considerations

### Query Optimization

- **Use indexes** for WHERE clauses on `durum`, `parti_no`, `gidis_tarihi`
- **Limit results** - Default query limit is 100 batches
- **Use JOINs efficiently** - Product details are normalized

### Table Partitioning (Future)

For large datasets (>1M batches), consider partitioning:

```sql
-- Example: Partition by year
CREATE TABLE temizleme_partiler_2024 PARTITION OF temizleme_partiler
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Archival Strategy

Archive old batches (>1 year) to separate tables to maintain performance.

---

## Sample Queries

### Get batches awaiting QC

```sql
SELECT * FROM temizleme_partiler
WHERE durum = 'kalite_kontrol'
ORDER BY donus_tarihi;
```

### Calculate total losses

```sql
SELECT
  SUM(ABS(adet_farki)) as total_adet_loss,
  SUM(ABS(kg_farki)) as total_kg_loss
FROM temizleme_partiler
WHERE adet_farki < 0;
```

### Get product quality statistics

```sql
SELECT
  u.urun_kodu,
  AVG(kk.hata_orani) as avg_error_rate,
  COUNT(kk.id) as total_inspections
FROM temizleme_kalite_kontrol_log kk
JOIN temizleme_partiler p ON kk.parti_id = p.id
JOIN temizleme_parti_urunler pu ON pu.parti_id = p.id
JOIN surec_urunler u ON pu.urun_id = u.id
GROUP BY u.urun_kodu
ORDER BY avg_error_rate DESC;
```

### Find unpaid batches

```sql
SELECT
  parti_no,
  odenecek_tutar,
  odenen_tutar,
  (odenecek_tutar - odenen_tutar) as kalan
FROM temizleme_partiler
WHERE odeme_durumu IN ('odenecek', 'kismen_odendi')
ORDER BY gidis_tarihi;
```
