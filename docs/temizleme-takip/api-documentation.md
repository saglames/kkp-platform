# Temizleme Takip API Documentation

**Version:** 1.0
**Base URL:** `/api/temizleme-takip`

## Table of Contents

1. [Authentication](#authentication)
2. [Batch Management](#batch-management)
3. [Quality Control](#quality-control)
4. [Pricing](#pricing)
5. [Payment](#payment)
6. [Reporting](#reporting)
7. [Error Handling](#error-handling)

## Authentication

Currently, the API uses the same authentication as the main KKP platform. The `yapan` (user) field is passed in request bodies.

## Batch Management

### Create Batch

Creates a new cleaning batch with multiple products.

**Endpoint:** `POST /partiler`

**Request Body:**
```json
{
  "parti_no": "P-2024-001",
  "irsaliye_no": "IRS-123456",
  "gidis_tarihi": "2024-01-15",
  "gidis_kg": 150.5,
  "gidis_adet": 500,
  "gidis_notlar": "Urgent cleaning required",
  "urunler": [
    {
      "urun_id": 123,
      "gidis_adet": 300,
      "gidis_kg": 90.5
    },
    {
      "urun_id": 124,
      "gidis_adet": 200,
      "gidis_kg": 60.0
    }
  ],
  "yapan": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "parti": {
    "id": 1,
    "parti_no": "P-2024-001",
    "durum": "gonderildi",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Business Logic:**
1. Creates batch record in `temizleme_partiler`
2. Creates product records in `temizleme_parti_urunler`
3. Updates `surec_temizlemede_olan` inventory
4. Logs movement in `surec_hareket_log`
5. All operations in a transaction (ACID compliant)

**Validation:**
- `parti_no`, `gidis_tarihi`, `gidis_adet` are required
- `urunler` array must have at least one product
- Each product must have valid `urun_id` and `gidis_adet > 0`

---

### Create Manual Batch

Creates a batch by manually entering product code (useful for external/unknown products).

**Endpoint:** `POST /partiler/manuel`

**Request Body:**
```json
{
  "parti_no": "P-2024-002",
  "irsaliye_no": "IRS-123457",
  "gidis_tarihi": "2024-01-15",
  "urun_kodu": "JOINT-45-A",
  "gidis_adet": 100,
  "gidis_kg": 25.5,
  "gidis_notlar": "Manual entry for external product",
  "yapan": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "parti": {
    "id": 2,
    "parti_no": "P-2024-002",
    "durum": "gonderildi"
  }
}
```

**Business Logic:**
1. Searches for product in `surec_urunler` by code
2. If not found, creates new product record with tip='Manuel Giriş'
3. Creates batch and updates inventory (same as regular batch creation)

---

### List Batches

Retrieve batches with optional filtering.

**Endpoint:** `GET /partiler`

**Query Parameters:**
- `durum` (optional): Filter by status (gonderildi, kalite_kontrol, kabul, red, tekrar_temizlik)
- `parti_no` (optional): Search by batch number (partial match)
- `baslangic_tarihi` (optional): Filter by start date
- `bitis_tarihi` (optional): Filter by end date

**Example:**
```
GET /partiler?durum=kalite_kontrol&parti_no=P-2024
```

**Response:**
```json
[
  {
    "id": 1,
    "parti_no": "P-2024-001",
    "irsaliye_no": "IRS-123456",
    "gidis_tarihi": "2024-01-15",
    "gidis_adet": 500,
    "gidis_kg": 150.5,
    "donus_tarihi": "2024-01-20",
    "donus_adet": 490,
    "donus_kg": 148.0,
    "adet_farki": -10,
    "kg_farki": -2.5,
    "durum": "kalite_kontrol",
    "kalite_durum": null
  }
]
```

**Notes:**
- Returns maximum 100 records
- Ordered by `gidis_tarihi DESC, id DESC`
- `adet_farki` and `kg_farki` are calculated columns (return - departure)

---

### Get Batch Details

Retrieve detailed information about a specific batch.

**Endpoint:** `GET /partiler/:id`

**Response:**
```json
{
  "parti": {
    "id": 1,
    "parti_no": "P-2024-001",
    "gidis_tarihi": "2024-01-15",
    "donus_tarihi": "2024-01-20",
    "durum": "kalite_kontrol",
    "kalite_durum": null
  },
  "urunler": [
    {
      "id": 1,
      "parti_id": 1,
      "urun_id": 123,
      "urun_kodu": "JOINT-45-A",
      "tip": "A",
      "gidis_adet": 300,
      "gidis_kg": 90.5,
      "donus_adet": 295,
      "donus_kg": 89.0,
      "adet_farki": -5,
      "kg_farki": -1.5,
      "hata_adet": 0
    }
  ],
  "kaliteGecmis": []
}
```

---

### Update Batch

Update batch information (notes, waybill number).

**Endpoint:** `PUT /partiler/:id`

**Request Body:**
```json
{
  "irsaliye_no": "IRS-999999",
  "gidis_notlar": "Updated notes",
  "donus_notlar": "Return notes",
  "yapan": "User Name"
}
```

**Response:**
```json
{
  "id": 1,
  "parti_no": "P-2024-001",
  "irsaliye_no": "IRS-999999",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

---

### Delete Batch

Delete a batch and all related records (CASCADE).

**Endpoint:** `DELETE /partiler/:id`

**Response:**
```json
{
  "success": true,
  "message": "Parti silindi"
}
```

**Warning:** This operation CASCADE deletes:
- All product records (`temizleme_parti_urunler`)
- All quality control logs (`temizleme_kalite_kontrol_log`)
- Does NOT reverse inventory movements

---

### Record Return

Record when a batch returns from cleaning.

**Endpoint:** `POST /partiler/:id/donus`

**Request Body:**
```json
{
  "donus_tarihi": "2024-01-20",
  "donus_kg": 148.0,
  "donus_adet": 490,
  "donus_notlar": "Some losses during cleaning",
  "urunler": [
    {
      "urun_id": 123,
      "gidis_adet": 300,
      "gidis_kg": 90.5,
      "donus_adet": 295,
      "donus_kg": 89.0
    },
    {
      "urun_id": 124,
      "gidis_adet": 200,
      "gidis_kg": 60.0,
      "donus_adet": 195,
      "donus_kg": 59.0
    }
  ],
  "yapan": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parti dönüşü kaydedildi"
}
```

**Business Logic:**
1. Updates batch with return information
2. Changes status to `kalite_kontrol`
3. Updates product return quantities
4. Decreases `surec_temizlemede_olan` inventory
5. Increases `surec_temizlemeden_gelen` inventory
6. Logs movement in `surec_hareket_log`

---

## Quality Control

### Perform Quality Control

Execute quality control inspection and make decision.

**Endpoint:** `POST /partiler/:id/kalite-kontrol`

**Request Body:**
```json
{
  "karar": "kabul",
  "kontrol_edilen_adet": 490,
  "hata_adet": 10,
  "hata_detay": {
    "JOINT-45-A": {
      "temizleme_problemi": 5,
      "vuruk_problem": 3,
      "polisaj": 2
    }
  },
  "aciklama": "Minor cleaning issues detected",
  "problem_kategorileri": [
    "JOINT-45-A: Temizleme Hatalı (5)",
    "JOINT-45-A: Vuruk (3)"
  ],
  "yapan": "QC Inspector"
}
```

**Karar (Decision) Options:**
- `kabul` - Accept batch, move to Sevke Hazır
- `red` - Reject batch
- `tekrar_temizlik` - Send back for re-cleaning

**Defect Categories (hata_detay keys):**
- `temizleme_problemi` - Cleaning issue
- `vuruk_problem` - Dent/deformation
- `capagi_alinmayan` - Cap not removed
- `polisaj` - Polishing issue
- `kaynak_az` - Insufficient welding
- `kaynak_akintisi` - Welding leak
- `ici_capakli` - Internal burr
- `pim_girmeyen` - Pin won't fit
- `boncuklu` - Beaded
- `yamuk` - Crooked
- `gramaji_dusuk` - Low weight
- `hurda` - Scrap

**Response:**
```json
{
  "success": true,
  "message": "Kalite kontrol tamamlandı",
  "hataOrani": "2.04"
}
```

**Business Logic - If Accept (kabul):**
1. Creates quality control log
2. Calculates payment amounts (payable = return - defective)
3. Updates `temizleme_parti_urunler` with payable/non-payable quantities
4. Changes batch status to `kabul`
5. Decreases `surec_temizlemeden_gelen` inventory
6. Increases `surec_sevke_hazir` inventory (grouped by base code)
7. Records defects in `hatali_urunler` table

**Business Logic - If Re-clean (tekrar_temizlik):**
1. Creates new batch with suffix (e.g., P-2024-001-T1)
2. Increments `tekrar_temizlik_sayisi` counter
3. Copies products to new batch
4. Adds quantities back to `surec_temizlemede_olan`

**Business Logic - If Reject (red):**
1. Records quality control decision
2. Batch remains in rejected state

---

### Get Quality Control History

Retrieve quality control history for a batch.

**Endpoint:** `GET /partiler/:id/kalite-gecmis`

**Response:**
```json
[
  {
    "id": 1,
    "parti_id": 1,
    "karar": "kabul",
    "karar_veren": "QC Inspector",
    "karar_tarihi": "2024-01-20T14:30:00.000Z",
    "kontrol_edilen_adet": 490,
    "hata_tespit_edilen_adet": 10,
    "hata_orani": "2.04",
    "aciklama": "Minor cleaning issues detected",
    "problem_kategorileri": ["JOINT-45-A: Temizleme Hatalı (5)"]
  }
]
```

---

## Pricing

### Get Active Pricing

Retrieve current active pricing configuration.

**Endpoint:** `GET /fiyatlandirma`

**Response:**
```json
{
  "id": 1,
  "urun_tipi": "genel",
  "birim_fiyat_kg": 0.75,
  "birim_fiyat_adet": 5.50,
  "aktif": true,
  "gecerli_tarih_baslangic": "2024-01-01",
  "gecerli_tarih_bitis": null
}
```

**Default Values:**
If no pricing is configured, returns defaults:
```json
{
  "birim_fiyat_kg": 0.75,
  "birim_fiyat_adet": 5.50
}
```

---

### Create Pricing Configuration

Set new pricing (deactivates previous pricing).

**Endpoint:** `POST /fiyatlandirma`

**Request Body:**
```json
{
  "birim_fiyat_kg": 0.80,
  "birim_fiyat_adet": 6.00,
  "urun_tipi": "genel",
  "notlar": "Price increase due to inflation",
  "yapan": "Manager"
}
```

**Response:**
```json
{
  "success": true,
  "fiyatlandirma": {
    "id": 2,
    "birim_fiyat_kg": 0.80,
    "birim_fiyat_adet": 6.00,
    "aktif": true,
    "gecerli_tarih_baslangic": "2024-01-20"
  }
}
```

**Business Logic:**
1. Deactivates current active pricing (sets `gecerli_tarih_bitis`)
2. Creates new pricing record with `aktif = true`

---

## Payment

### Calculate Payment

Calculate payment for a batch based on quality control results.

**Endpoint:** `POST /partiler/:id/odeme-hesapla`

**Prerequisites:**
- Batch must have `durum = 'kabul'` (quality control accepted)

**Response:**
```json
{
  "success": true,
  "parti_no": "P-2024-001",
  "toplam_odenecek": "2847.50",
  "birim_fiyat_kg": 0.75,
  "birim_fiyat_adet": 5.50,
  "urun_detaylari": [
    {
      "urun_kodu": "JOINT-45-A",
      "tip": "A",
      "gidis_adet": 300,
      "gidis_kg": 90.5,
      "donus_adet": 295,
      "donus_kg": 89.0,
      "odenecek_adet": 290,
      "odenecek_kg": 87.5,
      "odenmeyecek_adet": 5,
      "odenmeyecek_kg": 1.5,
      "hata_adet": 5,
      "tutar": "1660.63"
    }
  ]
}
```

**Formula:**
```
tutar = (odenecek_adet × birim_fiyat_adet) + (odenecek_kg × birim_fiyat_kg)
```

**Business Logic:**
1. Retrieves active pricing
2. Calculates payment for each product
3. Updates batch with `odenecek_tutar` and pricing snapshot
4. Sets `odeme_durumu = 'odenecek'`

---

### Record Payment

Record a payment transaction for a batch.

**Endpoint:** `POST /partiler/:id/odeme-kaydet`

**Request Body:**
```json
{
  "odeme_tutari": 1500.00,
  "odeme_tarihi": "2024-01-25",
  "odeme_yontemi": "Banka Transferi",
  "aciklama": "Partial payment 1/2",
  "yapan": "Accountant"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ödeme kaydedildi",
  "odenen_tutar": 1500.00,
  "kalan_borc": "1347.50",
  "odeme_durumu": "kismen_odendi"
}
```

**Payment Status (odeme_durumu):**
- `odenecek` - Not paid
- `kismen_odendi` - Partially paid
- `odendi` - Fully paid

**Business Logic:**
1. Creates payment log entry
2. Updates batch `odenen_tutar` (cumulative)
3. Updates `odeme_durumu` based on total paid vs total payable
4. All in transaction

---

### Get Payment Details

Get detailed payment information for a batch.

**Endpoint:** `GET /partiler/:id/odeme-detay`

**Response:**
```json
{
  "parti": {
    "id": 1,
    "parti_no": "P-2024-001",
    "odenecek_tutar": 2847.50,
    "odenen_tutar": 1500.00,
    "kalan_borc": 1347.50,
    "odeme_durumu": "kismen_odendi"
  },
  "urunler": [
    {
      "urun_kodu": "JOINT-45-A",
      "odenecek_adet": 290,
      "odenecek_kg": 87.5,
      "odenmeyecek_adet": 5
    }
  ],
  "odeme_gecmisi": [
    {
      "id": 1,
      "odeme_tipi": "kismen",
      "odeme_tutari": 1500.00,
      "odeme_tarihi": "2024-01-25T00:00:00.000Z",
      "odeme_yontemi": "Banka Transferi",
      "aciklama": "Partial payment 1/2"
    }
  ]
}
```

---

## Reporting

### Summary Report

Get overall summary statistics.

**Endpoint:** `GET /raporlar/ozet`

**Response:**
```json
{
  "toplam_parti": 150,
  "durum_dagilimi": {
    "gonderildi": 20,
    "kalite_kontrol": 15,
    "kabul": 100,
    "red": 10,
    "tekrar_temizlik": 5
  },
  "ortalama_kalite_orani": 97.50,
  "toplam_kg_kaybi": 125.5,
  "toplam_adet_kaybi": 450
}
```

**Notes:**
- `ortalama_kalite_orani` = 100 - average error rate
- Losses calculated from batches with negative differences

---

### Product-Based Loss Report

Get loss statistics grouped by product.

**Endpoint:** `GET /raporlar/urun-bazli`

**Response:**
```json
[
  {
    "urun_kodu": "JOINT-45-A",
    "tip": "A",
    "toplam_gidis_adet": 5000,
    "toplam_gidis_kg": 1500.0,
    "toplam_donus_adet": 4900,
    "toplam_donus_kg": 1470.0,
    "kayip_adet": 100,
    "kayip_kg": 30.0,
    "parti_sayisi": 10
  }
]
```

---

### Payment Report

Get payment status for all batches.

**Endpoint:** `GET /raporlar/odeme-raporu`

**Query Parameters:**
- `durum` (optional): Filter by payment status (odenecek, kismen_odendi, odendi)

**Response:**
```json
{
  "partiler": [
    {
      "id": 1,
      "parti_no": "P-2024-001",
      "gidis_tarihi": "2024-01-15",
      "donus_tarihi": "2024-01-20",
      "odenecek_tutar": 2847.50,
      "odenen_tutar": 1500.00,
      "odeme_durumu": "kismen_odendi",
      "toplam_odenecek_adet": 290,
      "toplam_odenecek_kg": 87.5,
      "toplam_odenmeyecek_adet": 5,
      "toplam_odenmeyecek_kg": 1.5
    }
  ],
  "ozet": {
    "toplam_parti": 1,
    "toplam_odenecek_tutar": 2847.50,
    "toplam_odenen_tutar": 1500.00,
    "kalan_borc": 1347.50
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Validation error or invalid data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Common Errors

**Validation Errors:**
```json
{
  "error": "Parti no, gidiş tarihi, gidiş adet ve ürünler gerekli!"
}
```

**Not Found:**
```json
{
  "error": "Parti bulunamadı!"
}
```

**Business Logic Errors:**
```json
{
  "error": "Ödeme hesabı için kalite kontrol kabul edilmelidir!"
}
```

### Transaction Errors

If any error occurs during a transaction, all changes are rolled back:

```javascript
try {
  await client.query('BEGIN');
  // ... operations
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Validate batch status** before state transitions
3. **Include yapan (user)** in all write operations for audit trail
4. **Handle concurrent updates** with appropriate locking if needed
5. **Log all critical operations** in `surec_hareket_log`

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production.

## Versioning

API version is indicated in documentation. Breaking changes will require new version.

**Current Version:** v1 (implicit, no version in URL)
