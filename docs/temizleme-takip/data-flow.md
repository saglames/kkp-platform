# Data Flow Documentation - Temizleme Takip System

**Version:** 1.0
**Last Updated:** 2026-01-04

## Table of Contents

1. [Overview](#overview)
2. [State Transitions](#state-transitions)
3. [Detailed Flow Diagrams](#detailed-flow-diagrams)
4. [Inventory Movement](#inventory-movement)
5. [Payment Flow](#payment-flow)
6. [Quality Control Flow](#quality-control-flow)
7. [Error Handling Flow](#error-handling-flow)

## Overview

This document describes how data flows through the Temizleme Takip system, including state transitions, inventory updates, and system interactions.

### Key Concepts

- **Parti (Batch)**: A group of products sent for cleaning together
- **State**: Current status in the workflow (Gönderildi, Kalite Kontrol, etc.)
- **Inventory Tables**: Database tables tracking product locations
- **Transaction**: Database transaction ensuring atomicity

## State Transitions

### Batch State Machine

```
                    ┌─────────────┐
                    │   START     │
                    └──────┬──────┘
                           │
                           ↓
                    ┌─────────────┐
              ┌────>│ Gönderildi  │
              │     │   (Sent)    │
              │     └──────┬──────┘
              │            │
              │            ↓
              │     ┌─────────────┐
              │     │   Kalite    │
              │     │   Kontrol   │
              │     └──────┬──────┘
              │            │
              │     ┌──────┴──────┐
              │     │             │             │
              │     ↓             ↓             ↓
              │ ┌────────┐   ┌────────┐   ┌──────────┐
              │ │ Kabul  │   │  Red   │   │  Tekrar  │
              │ │(Accept)│   │(Reject)│   │ Temizlik │
              │ └────────┘   └────────┘   └──────┬───┘
              │                                   │
              └───────────────────────────────────┘
                                    (Creates new batch with -T suffix)
```

### State Definitions

| State | Turkish | Description | Next States |
|-------|---------|-------------|-------------|
| **gonderildi** | Gönderildi | Sent for cleaning | kalite_kontrol |
| **kalite_kontrol** | Kalite Kontrol | Awaiting QC | kabul, red, tekrar_temizlik |
| **kabul** | Kabul | Accepted | (Terminal state) |
| **red** | Red | Rejected | (Terminal state) |
| **tekrar_temizlik** | Tekrar Temizlik | Re-cleaning | (Creates new batch) |

## Detailed Flow Diagrams

### Flow 1: Batch Creation

```
┌─────────────────────────────────────────────────────────────────┐
│ User Action: Create Batch                                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: PartiOlusturModal                                      │
│ - User enters parti_no, irsaliye_no, gidis_tarihi               │
│ - User selects products and quantities                          │
│ - Validates: parti_no required, gidis_adet > 0                  │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓ POST /api/temizleme-takip/partiler
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Backend: partiOlustur() function                                │
│                                                                  │
│ BEGIN TRANSACTION                                               │
│                                                                  │
│ 1. INSERT INTO temizleme_partiler                               │
│    - parti_no, irsaliye_no, gidis_tarihi                        │
│    - gidis_kg, gidis_adet (totals)                              │
│    - durum = 'gonderildi'                                       │
│    - created_by = kullanici                                     │
│    RETURNS: parti_id                                            │
│                                                                  │
│ 2. For each product:                                            │
│    INSERT INTO temizleme_parti_urunler                          │
│    - parti_id, urun_id                                          │
│    - gidis_adet, gidis_kg                                       │
│                                                                  │
│ 3. For each product:                                            │
│    INSERT INTO surec_temizlemede_olan                           │
│    ON CONFLICT (urun_id) DO UPDATE                              │
│    - adet += gidis_adet                                         │
│    - gidis_kg += gidis_kg                                       │
│    - parti_id = parti_id                                        │
│                                                                  │
│ 4. INSERT INTO surec_hareket_log                                │
│    - islem_tipi = 'parti_gonderildi'                            │
│    - kaynak = 'sistem'                                          │
│    - hedef = 'temizlemede_olan'                                 │
│    - adet, kg, parti_id, yapan                                  │
│                                                                  │
│ COMMIT TRANSACTION                                              │
│                                                                  │
│ IF ERROR: ROLLBACK                                              │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Result:                                                          │
│ - Batch created with status 'gonderildi'                        │
│ - Products added to batch                                       │
│ - Inventory updated (surec_temizlemede_olan)                    │
│ - Movement logged                                               │
│ - Frontend shows success message                                │
└──────────────────────────────────────────────────────────────────┘
```

### Flow 2: Record Return

```
┌─────────────────────────────────────────────────────────────────┐
│ User Action: Record Batch Return                                │
│ Prerequisite: Batch status = 'gonderildi'                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: PartiDonusModal                                        │
│ - User enters donus_tarihi, donus_adet, donus_kg                │
│ - For each product: donus_adet, donus_kg                        │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓ POST /api/temizleme-takip/partiler/:id/donus
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Backend: partiDonusuKaydet() function                           │
│                                                                  │
│ BEGIN TRANSACTION                                               │
│                                                                  │
│ 1. UPDATE temizleme_partiler                                    │
│    - donus_tarihi, donus_kg, donus_adet                         │
│    - donus_notlar                                               │
│    - durum = 'kalite_kontrol'                                   │
│    - adet_farki = calculated (donus - gidis)                    │
│    - kg_farki = calculated (donus - gidis)                      │
│                                                                  │
│ 2. For each product:                                            │
│    UPDATE temizleme_parti_urunler                               │
│    - donus_adet, donus_kg                                       │
│    - adet_farki = calculated (donus - gidis)                    │
│    - kg_farki = calculated (donus - gidis)                      │
│                                                                  │
│ 3. For each product:                                            │
│    UPDATE surec_temizlemede_olan                                │
│    - adet -= gidis_adet (remove sent quantity)                  │
│    - gidis_kg -= gidis_kg                                       │
│                                                                  │
│ 4. For each product:                                            │
│    INSERT INTO surec_temizlemeden_gelen                         │
│    ON CONFLICT (urun_id) DO UPDATE                              │
│    - adet += donus_adet                                         │
│    - kg += donus_kg                                             │
│    - parti_id = parti_id                                        │
│    - kalite_kontrol_durum = 'beklemede'                         │
│                                                                  │
│ 5. INSERT INTO surec_hareket_log                                │
│    - islem_tipi = 'parti_donus'                                 │
│    - kaynak = 'temizlemede_olan'                                │
│    - hedef = 'kalite_kontrol'                                   │
│    - adet, kg, parti_id                                         │
│                                                                  │
│ COMMIT TRANSACTION                                              │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Result:                                                          │
│ - Batch status changed to 'kalite_kontrol'                      │
│ - Products removed from 'temizlemede_olan'                      │
│ - Products added to 'temizlemeden_gelen'                        │
│ - Differences calculated and stored                             │
│ - Ready for quality control                                     │
└──────────────────────────────────────────────────────────────────┘
```

### Flow 3: Quality Control - Accept Path

```
┌─────────────────────────────────────────────────────────────────┐
│ User Action: Perform Quality Control - Accept                   │
│ Prerequisite: Batch status = 'kalite_kontrol'                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: KaliteKontrolModal                                     │
│ - User enters kontrol_edilen_adet                               │
│ - User enters defects per product per category                  │
│ - User selects karar = 'kabul'                                  │
│ - User adds aciklama (notes)                                    │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓ POST /api/temizleme-takip/partiler/:id/kalite-kontrol
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Backend: kaliteKontrolYap() function                            │
│                                                                  │
│ BEGIN TRANSACTION                                               │
│                                                                  │
│ 1. Calculate hata_orani (error rate)                            │
│    hata_orani = (hata_adet / kontrol_edilen_adet) × 100         │
│                                                                  │
│ 2. INSERT INTO temizleme_kalite_kontrol_log                     │
│    - parti_id, karar = 'kabul'                                  │
│    - kontrol_edilen_adet, hata_tespit_edilen_adet               │
│    - hata_orani, aciklama                                       │
│    - problem_kategorileri (JSONB)                               │
│    - karar_veren = kullanici                                    │
│                                                                  │
│ 3. For each product with defects:                               │
│    Calculate:                                                   │
│    - odenecek_adet = donus_adet - total_hata                    │
│    - odenmeyecek_adet = total_hata                              │
│    - odenecek_kg = calculated from birim_agirlik                │
│    - odenmeyecek_kg = calculated from birim_agirlik             │
│                                                                  │
│    UPDATE temizleme_parti_urunler                               │
│    - odenecek_adet, odenecek_kg                                 │
│    - odenmeyecek_adet, odenmeyecek_kg                           │
│    - hata_adet = total_hata                                     │
│                                                                  │
│ 4. UPDATE temizleme_partiler                                    │
│    - kalite_durum = 'kabul'                                     │
│    - durum = 'kabul'                                            │
│    - kalite_kontrol_tarihi = CURRENT_TIMESTAMP                  │
│    - kalite_kontrol_yapan = kullanici                           │
│    - kalite_notlar = aciklama                                   │
│                                                                  │
│ 5. For each product:                                            │
│    UPDATE surec_temizlemeden_gelen                              │
│    - adet -= donus_adet (remove from QC queue)                  │
│    - kg -= donus_kg                                             │
│    - kalite_kontrol_durum = 'kabul'                             │
│                                                                  │
│ 6. For each product:                                            │
│    Get base code (remove (A)/(B) suffix)                        │
│    INSERT INTO surec_sevke_hazir                                │
│    ON CONFLICT (urun_kodu_base) DO UPDATE                       │
│    - adet += donus_adet                                         │
│    NOTE: Groups A and B variants together                       │
│                                                                  │
│ 7. If defects exist:                                            │
│    For each product with defects:                               │
│      INSERT INTO hatali_urunler                                 │
│      ON CONFLICT (parti_no, urun_kodu) DO UPDATE                │
│      - temizleme_parti_id = parti_id                            │
│      - kaynak = 'kalite_kontrol'                                │
│      - [12 defect category columns]                             │
│      (Accumulates counts if already exists)                     │
│                                                                  │
│ COMMIT TRANSACTION                                              │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Result:                                                          │
│ - Batch accepted, status = 'kabul'                              │
│ - QC log created with error rate                                │
│ - Payment amounts calculated (payable/non-payable)              │
│ - Products moved to 'sevke_hazir'                               │
│ - Defects recorded in hatali_urunler                            │
│ - Ready for payment calculation                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Flow 4: Quality Control - Re-clean Path

```
┌─────────────────────────────────────────────────────────────────┐
│ User Action: Perform Quality Control - Re-clean                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Backend: kaliteKontrolYap() - Re-clean branch                   │
│                                                                  │
│ BEGIN TRANSACTION                                               │
│                                                                  │
│ 1. Get original batch info                                      │
│    SELECT * FROM temizleme_partiler WHERE id = parti_id         │
│                                                                  │
│ 2. Generate new batch number                                    │
│    parti_no = original_parti_no + '-T' + (tekrar_sayisi + 1)    │
│    Example: P-2024-001 → P-2024-001-T1                          │
│                                                                  │
│ 3. INSERT INTO temizleme_partiler (new batch)                   │
│    - parti_no = generated number                                │
│    - ana_parti_id = original batch id                           │
│    - gidis_tarihi = CURRENT_DATE                                │
│    - gidis_adet = original donus_adet                           │
│    - gidis_kg = original donus_kg                               │
│    - durum = 'gonderildi'                                       │
│    - tekrar_temizlik_sayisi = original count + 1                │
│    RETURNS: new_parti_id                                        │
│                                                                  │
│ 4. UPDATE temizleme_partiler (original batch)                   │
│    - tekrar_temizlik_sayisi += 1                                │
│    - durum = 'tekrar_temizlik'                                  │
│                                                                  │
│ 5. Get products from original batch                             │
│    SELECT * FROM temizleme_parti_urunler                        │
│    WHERE parti_id = original_parti_id                           │
│                                                                  │
│ 6. For each product:                                            │
│    INSERT INTO temizleme_parti_urunler (new batch)              │
│    - parti_id = new_parti_id                                    │
│    - urun_id, gidis_adet, gidis_kg                              │
│    (Copy from original batch's donus quantities)                │
│                                                                  │
│ 7. For each product:                                            │
│    UPDATE surec_temizlemede_olan                                │
│    - adet += donus_adet (add back to cleaning)                  │
│    - gidis_kg += donus_kg                                       │
│                                                                  │
│ 8. For each product:                                            │
│    UPDATE surec_temizlemeden_gelen                              │
│    - adet -= donus_adet (remove from QC queue)                  │
│    - kg -= donus_kg                                             │
│                                                                  │
│ COMMIT TRANSACTION                                              │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Result:                                                          │
│ - New batch created with -T suffix                              │
│ - Original batch marked as 'tekrar_temizlik'                    │
│ - Products returned to 'temizlemede_olan'                       │
│ - Can go through process again                                  │
│ - Unlimited re-cleaning iterations supported                    │
└──────────────────────────────────────────────────────────────────┘
```

## Inventory Movement

### Inventory State Transitions

```
Product Lifecycle:

Manufacturing
     ↓
┌──────────────────────┐
│ surec_temizlemeye_   │  (Managed by Tüm Süreç)
│     gidecek          │
└──────────┬───────────┘
           │ Create Batch
           ↓
┌──────────────────────┐
│ surec_temizlemede_   │  (Shared - Temizleme Takip writes)
│     olan             │  Count: Cumulative (multiple batches)
└──────────┬───────────┘
           │ Record Return
           ↓
┌──────────────────────┐
│ surec_temizlemeden_  │  (Shared - Temizleme Takip writes)
│     gelen            │  Count: Cumulative (multiple batches)
│ kalite_kontrol_durum │  Status: beklemede → kabul/red
└──────────┬───────────┘
           │ QC Accept
           ↓
┌──────────────────────┐
│ surec_sevke_hazir    │  (Shared - Temizleme Takip writes)
│                      │  Grouped by base code (A+B combined)
└──────────┬───────────┘
           │ Ship
           ↓
    Shipped (Tüm Süreç)
```

### Inventory Count Examples

**Scenario:** Two batches in different states

```
Batch P-001:
- JOINT-45-A: 100 pieces (sent, not returned yet)

Batch P-002:
- JOINT-45-A: 200 pieces (returned, in QC)

Inventory state:
surec_temizlemede_olan:
  urun_id=1 (JOINT-45-A): adet=100  (only P-001)

surec_temizlemeden_gelen:
  urun_id=1 (JOINT-45-A): adet=200  (only P-002)

After P-002 is accepted:
surec_temizlemeden_gelen:
  urun_id=1 (JOINT-45-A): adet=0    (removed)

surec_sevke_hazir:
  urun_kodu_base='JOINT-45': adet=200  (grouped by base)
```

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Prerequisite: Batch status = 'kabul'                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: Calculate Payment                                       │
│ POST /api/temizleme-takip/partiler/:id/odeme-hesapla            │
│                                                                  │
│ 1. Get active pricing                                           │
│    SELECT * FROM temizleme_fiyatlandirma                        │
│    WHERE aktif = true                                           │
│                                                                  │
│ 2. For each product:                                            │
│    odenecek_adet = already calculated by QC                     │
│    odenecek_kg = already calculated by QC                       │
│                                                                  │
│    tutar = (odenecek_adet × birim_fiyat_adet) +                 │
│            (odenecek_kg × birim_fiyat_kg)                       │
│                                                                  │
│ 3. UPDATE temizleme_partiler                                    │
│    - birim_fiyat_kg = current pricing (snapshot)                │
│    - birim_fiyat_adet = current pricing (snapshot)              │
│    - odenecek_tutar = sum of all product tutars                 │
│    - odeme_durumu = 'odenecek'                                  │
│                                                                  │
│ Response: Total payment + breakdown per product                 │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Record Payment(s)                                       │
│ POST /api/temizleme-takip/partiler/:id/odeme-kaydet             │
│                                                                  │
│ Can be called multiple times for partial payments               │
│                                                                  │
│ BEGIN TRANSACTION                                               │
│                                                                  │
│ 1. Get current batch info                                       │
│    SELECT odenecek_tutar, odenen_tutar FROM temizleme_partiler  │
│                                                                  │
│ 2. Calculate new totals                                         │
│    yeni_odenen_tutar = odenen_tutar + odeme_tutari              │
│                                                                  │
│ 3. Determine payment status                                     │
│    IF yeni_odenen_tutar >= odenecek_tutar:                      │
│      odeme_durumu = 'odendi'                                    │
│      odeme_tipi = 'tam'                                         │
│    ELSE:                                                        │
│      odeme_durumu = 'kismen_odendi'                             │
│      odeme_tipi = 'kismen'                                      │
│                                                                  │
│ 4. INSERT INTO temizleme_odeme_log                              │
│    - parti_id                                                   │
│    - odeme_tipi = calculated above                              │
│    - odeme_tutari = payment amount                              │
│    - odeme_tarihi = payment date                                │
│    - odeme_yontemi = payment method                             │
│    - aciklama = notes                                           │
│    - created_by = kullanici                                     │
│                                                                  │
│ 5. UPDATE temizleme_partiler                                    │
│    - odenen_tutar = yeni_odenen_tutar                           │
│    - odeme_durumu = calculated status                           │
│    - odeme_tarihi = latest payment date                         │
│                                                                  │
│ COMMIT TRANSACTION                                              │
│                                                                  │
│ Response: Updated totals + remaining balance                    │
└──────────────────────────────────────────────────────────────────┘
```

### Payment Example

```
Batch P-2024-001:
  Product 1: 285 pieces @ ₺5.50 = ₺1,567.50
  Product 1: 86 kg @ ₺0.75 = ₺64.50
  Total: ₺1,632.00

Payment 1 (Jan 25):
  Amount: ₺800.00
  Status: 'kismen_odendi'
  Remaining: ₺832.00

Payment 2 (Feb 1):
  Amount: ₺832.00
  Status: 'odendi'
  Remaining: ₺0.00
```

## Quality Control Flow

### Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│ Quality Control Decision                                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
        ┌────────┴────────┐
        │                 │
        ↓                 ↓
  Is quality      Is quality
  acceptable?     fixable?
        │                 │
        ↓                 ↓
    ┌───────┐       ┌──────────┐
    │ Kabul │       │ Tekrar   │
    │       │       │ Temizlik │
    └───────┘       └──────────┘
                          │
                          ↓
                    Is quality
                    still bad?
                          │
                          ↓
                      ┌────────┐
                      │  Red   │
                      └────────┘
```

### Defect Tracking Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Quality Control Detects Defects                                 │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: Record in temizleme_parti_urunler                       │
│                                                                  │
│ hata_detay (JSONB) = {                                           │
│   "temizleme_problemi": 5,                                       │
│   "vuruk_problem": 3,                                            │
│   "polisaj": 2                                                   │
│ }                                                                │
│                                                                  │
│ hata_adet = 10 (sum of all categories)                           │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Calculate payment impact                                │
│                                                                  │
│ odenecek_adet = donus_adet - hata_adet                           │
│ odenmeyecek_adet = hata_adet                                     │
│                                                                  │
│ If birim_agirlik exists:                                         │
│   odenmeyecek_kg = (hata_adet × birim_agirlik) / 1000            │
│   odenecek_kg = donus_kg - odenmeyecek_kg                        │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 3: Record in hatali_urunler (shared table)                 │
│                                                                  │
│ INSERT INTO hatali_urunler                                       │
│ ON CONFLICT (parti_no, urun_kodu) DO UPDATE                      │
│                                                                  │
│ Accumulates counts across multiple QC sessions                  │
│ Shared with other systems for defect analysis                   │
└──────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

### Transaction Rollback Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Any Database Operation                                          │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
          TRY {
            BEGIN TRANSACTION
                 │
                 ↓
            Operation 1 (e.g., INSERT batch)
                 │
                 ↓
            Operation 2 (e.g., INSERT products)
                 │
                 ↓
            Operation 3 (e.g., UPDATE inventory)
                 │
                 ↓
            Operation 4 (e.g., INSERT log)
                 │
                 ↓
            COMMIT TRANSACTION
                 │
                 ↓
            Return success
          }
          CATCH (error) {
                 │
                 ↓
            ROLLBACK TRANSACTION
                 │
                 ↓
            All changes reverted
                 │
                 ↓
            Log error
                 │
                 ↓
            Throw error to client
          }
          FINALLY {
                 │
                 ↓
            Release database connection
          }
```

### Validation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ API Request Received                                             │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 1: Input Validation                                        │
│                                                                  │
│ Check required fields:                                           │
│ - parti_no exists?                                               │
│ - gidis_tarihi valid date?                                       │
│ - gidis_adet > 0?                                                │
│ - urunler array not empty?                                       │
│                                                                  │
│ IF validation fails:                                             │
│   Return 400 Bad Request                                         │
│   { "error": "Validation message" }                              │
└────────────────┬─────────────────────────────────────────────────┘
                 │ Validation passed
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 2: Business Logic Validation                               │
│                                                                  │
│ Check business rules:                                            │
│ - Batch status correct for operation?                            │
│ - Product exists in surec_urunler?                               │
│ - Sufficient inventory for operation?                            │
│                                                                  │
│ IF validation fails:                                             │
│   Return 400 Bad Request                                         │
│   { "error": "Business rule message" }                           │
└────────────────┬─────────────────────────────────────────────────┘
                 │ All validations passed
                 ↓
┌──────────────────────────────────────────────────────────────────┐
│ Step 3: Execute Operation                                       │
│                                                                  │
│ WITH transaction safety (as shown above)                         │
└──────────────────────────────────────────────────────────────────┘
```

## Summary: Complete Data Flow

```
┌─────────────┐
│   Create    │──┐
│   Batch     │  │
└─────────────┘  │
                 │
┌─────────────┐  │
│   Record    │  │  All operations:
│   Return    │  │  - Use transactions
└─────────────┘  ├─ - Validate input
                 │  - Update multiple tables
┌─────────────┐  │  - Log movements
│  Quality    │  │  - Handle errors
│  Control    │  │  - Maintain consistency
└─────────────┘  │
                 │
┌─────────────┐  │
│  Calculate  │  │
│  Payment    │  │
└─────────────┘  │
                 │
┌─────────────┐  │
│   Record    │  │
│  Payment    │──┘
└─────────────┘
```

---

**Document Version:** 1.0
**Last Reviewed:** 2026-01-04
